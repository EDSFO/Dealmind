/**
 * Reprocess conversations through OpenAI to regenerate insights
 * Uses the corrected parser that saves data to the proper fields.
 *
 * Run: node -r dotenv/config scripts/reanalyze-conversations.cjs
 */
require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('../generated/prisma/index.js');
const https = require('https');

const prisma = new PrismaClient({ log: ['error'] });

const OPENAI_API_KEY = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
const BASE_URL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';

const SYSTEM_PROMPT = `Você é um Consultor Comercial Sênior especializado em análise de vendas B2B. Sua função é analisar transcrições de reuniões comerciais e fornecer insights acionáveis para maximizar as chances de fechamento.

## REGRAS CRÍTICAS DE FORMATAÇÃO

1. **RESUMO EXECUTIVO**: Máximo 200 caracteres, seja conciso e direto
2. **LISTAS**: Use apenas itens curtos e objetivos (máximo 15 palavras cada)
3. **IDIOMA**: Todo o conteúdo DEVE estar em PORTUGUÊS BRASILEIRO
4. **JSON**: Retorne APENAS JSON válido, sem markdown, sem texto extra

## ESTRUTURA DE SAÍDA (JSON)

{
  "summary": "Frase curta resumindo a reunião em português",
  "interests": ["item1", "item2"],
  "objections": ["item1", "item2"],
  "commitments": ["item1", "item2"],
  "nextActions": ["item1", "item2"],
  "progressSignals": [{"signal": "descrição curta", "confidence": 0.0}],
  "riskSignals": [{"signal": "descrição curta", "severity": "low|medium|high"}],
  "confidence": 0.0,
  "recommendation": "ACELERAR|NUTRIR|REAVALIAR|DESQUALIFICAR"
}

## REGRAS
- NUNCA use listas com mais de 5 itens
- Cada item deve ter no máximo 15 palavras
- Não invente informações não mencionadas na transcrição
- Se não tiver informação, use array vazio []`;

async function callOpenAI(transcription, subject) {
    const body = JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: `## TRANSCRIÇÃO DA REUNIÃO\n\n${transcription}\n\n${subject ? `## TÓPICO: ${subject}` : ''}\n\nAnalise e retorne JSON.` }
        ],
        temperature: 0.1,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
    });

    return new Promise((resolve, reject) => {
        const url = new URL(`${BASE_URL}/chat/completions`);
        const options = {
            hostname: url.hostname,
            path: url.pathname + url.search,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Length': Buffer.byteLength(body),
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    const content = json.choices?.[0]?.message?.content;
                    if (content) resolve(JSON.parse(content));
                    else reject(new Error(`No content in response: ${data.substring(0, 200)}`));
                } catch (e) {
                    reject(new Error(`Parse error: ${e.message}. Raw: ${data.substring(0, 200)}`));
                }
            });
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

async function main() {
    if (!OPENAI_API_KEY) {
        console.error('❌ No API key found. Set OPENROUTER_API_KEY or OPENAI_API_KEY in .env');
        process.exit(1);
    }

    console.log(`Using API: ${BASE_URL}`);

    // Find conversations that need reprocessing (have empty interests)
    const conversations = await prisma.conversation.findMany({
        where: {
            transcriptionText: { not: null },
            OR: [
                { processingStatus: 'FAILED' },
                {
                    processingStatus: 'COMPLETED', insight: {
                        AND: [
                            // Hack: we check if interests is an empty JSON array
                        ]
                    }
                }
            ]
        },
        include: { insight: true },
        orderBy: { updatedAt: 'desc' },
    });

    // Filter: conversations with empty interests
    const needsReprocess = conversations.filter(conv => {
        if (!conv.transcriptionText) return false;
        const insight = conv.insight;
        if (!insight) return true; // No insight at all
        const hasData = (Array.isArray(insight.interests) && insight.interests.length > 0) ||
            (Array.isArray(insight.objections) && insight.objections.length > 0);
        return !hasData;
    });

    console.log(`Found ${needsReprocess.length} conversations that need reprocessing\n`);

    let success = 0;
    let failed = 0;

    for (const conv of needsReprocess) {
        console.log(`[${conv.id.substring(0, 8)}] "${conv.subject || 'Sem assunto'}" - Processing...`);

        try {
            const parsed = await callOpenAI(conv.transcriptionText, conv.subject);

            const interests = (Array.isArray(parsed.interests) ? parsed.interests : []).filter(v => typeof v === 'string');
            const objections = (Array.isArray(parsed.objections) ? parsed.objections : []).filter(v => typeof v === 'string');
            const commitments = (Array.isArray(parsed.commitments) ? parsed.commitments : []).filter(v => typeof v === 'string');
            const nextActions = (Array.isArray(parsed.nextActions) ? parsed.nextActions : []).filter(v => typeof v === 'string');
            const progressSignals = Array.isArray(parsed.progressSignals) ? parsed.progressSignals : [];
            const riskSignals = Array.isArray(parsed.riskSignals) ? parsed.riskSignals : [];

            if (parsed.recommendation) {
                progressSignals.push({ signal: `Recomendação: ${parsed.recommendation}`, confidence: parsed.confidence || 0.7 });
            }

            await prisma.insight.upsert({
                where: { conversationId: conv.id },
                create: {
                    conversationId: conv.id,
                    summary: parsed.summary || 'Análise concluída',
                    interests,
                    objections,
                    commitments,
                    nextActions,
                    progressSignals,
                    riskSignals,
                },
                update: {
                    summary: parsed.summary || 'Análise concluída',
                    interests,
                    objections,
                    commitments,
                    nextActions,
                    progressSignals,
                    riskSignals,
                }
            });

            await prisma.conversation.update({
                where: { id: conv.id },
                data: { processingStatus: 'COMPLETED' }
            });

            console.log(`  ✓ Done! interests:${interests.length} obj:${objections.length} actions:${nextActions.length}`);
            console.log(`    Summary: "${(parsed.summary || '').substring(0, 80)}"`);
            success++;

            // Rate limiting - wait 1 second between requests
            await new Promise(r => setTimeout(r, 1000));
        } catch (e) {
            console.log(`  ✗ Failed: ${e.message}`);
            failed++;
        }
        console.log('');
    }

    console.log(`====================================`);
    console.log(`Done! ✓ ${success} reprocessed, ✗ ${failed} failed`);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
