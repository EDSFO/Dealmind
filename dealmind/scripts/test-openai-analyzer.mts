/**
 * Test Script for OpenAI/OpenRouter Integration
 *
 * Usage:
 *   npx tsx scripts/test-openai-analyzer.mts
 */

import OpenAI from "openai";
import { resolve } from "path";
import { config } from "dotenv";

// Load environment variables
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

// ============================================================================
// Configuration
// ============================================================================

const API_KEY = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
const BASE_URL = process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";

// ============================================================================
// Test Data
// ============================================================================

const TEST_TRANSCRIPTION = `
João: Olá, gostaria de saber mais sobre o plano Enterprise da sua solução.
Maria: Claro! O plano Enterprise inclui todos os recursos do Pro, além de suporte dedicado 24/7, SLA de 99.9% e um gerente de conta dedicado.
João: Qual é o investimento mensal?
Maria: O plano Enterprise parte de R$ 2.000/mês, mas podemos personalizar conforme sua necessidade.
João: Interessante. Vou discutir com minha equipe e retorno até terça-feira.
Maria: Perfeito! Na terça-feira agendo uma apresentação técnica com nossa equipe.
`;

const SYSTEM_PROMPT = `Você é um Consultor Comercial Sênior especializado em análise de vendas B2B. Sua função é analisar transcrições de reuniões comerciais e fornecer insights acionáveis para maximizar as chances de fechamento.

Analise a transcrição e retorne um JSON com a seguinte estrutura:
{
  "summary": "Resumo executivo em 3-4 linhas",
  "interests": ["lista de interesses identificados"],
  "objections": ["lista de objeções ou preocupações"],
  "commitments": ["compromissos assumidos pelo cliente"],
  "nextActions": ["próximas ações recomendadas"],
  "progressSignals": [{"signal": "sinal de progresso", "confidence": 0.0-1.0}],
  "riskSignals": [{"signal": "sinal de risco", "severity": "low|medium|high"}],
  "confidence": 0.0-1.0,
  "recommendation": "ACELERAR|NUTRIR|REAVALIAR|DESQUALIFICAR"
}`;

// ============================================================================
// Test Functions
// ============================================================================

async function testOpenAIAnalyzer() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     OpenAI/OpenRouter Integration Test                   ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  // Validate environment
  if (!API_KEY) {
    console.error('\n❌ Neither OPENROUTER_API_KEY nor OPENAI_API_KEY set');
    console.log('   Add one of these to your .env file');
    process.exit(1);
  }

  console.log('\n✅ API key found');
  console.log(`   Provider: ${process.env.OPENROUTER_API_KEY ? 'OpenRouter' : 'OpenAI'}`);

  // Initialize OpenAI client
  const client = new OpenAI({
    apiKey: API_KEY,
    baseURL: BASE_URL,
  });

  // Run test
  try {
    console.log('\n🚀 Analyzing test transcription...');
    console.log('   (This may take 10-30 seconds)\n');

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Analise esta transcrição:\n\n${TEST_TRANSCRIPTION}` },
      ],
      temperature: 0.1,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error("Empty response from OpenAI");
    }

    const result = JSON.parse(content);

    console.log('✅ Analysis successful!\n');
    console.log('─'.repeat(60));

    // Summary
    if (result.summary) {
      console.log('\n📋 RESUMO EXECUTIVO:');
      console.log(result.summary);
    }

    // Interests
    if (result.interests?.length) {
      console.log('\n🎯 INTERESSES IDENTIFICADOS:');
      result.interests.forEach((i: string) => console.log(`  • ${i}`));
    }

    // Objections
    if (result.objections?.length) {
      console.log('\n⚠️  OBJEÇÕES IDENTIFICADAS:');
      result.objections.forEach((o: string) => console.log(`  • ${o}`));
    }

    // Next Actions
    if (result.nextActions?.length) {
      console.log('\n📌 PRÓXIMAS AÇÕES:');
      result.nextActions.forEach((a: string) => console.log(`  • ${a}`));
    }

    // Progress Signals
    if (result.progressSignals?.length) {
      console.log('\n📈 SINAIS DE PROGRESSO:');
      result.progressSignals.forEach((s: any) => console.log(`  • ${s.signal} (${(s.confidence * 100).toFixed(0)}%)`));
    }

    // Risk Signals
    if (result.riskSignals?.length) {
      console.log('\n🚨 SINAIS DE RISCO:');
      result.riskSignals.forEach((r: any) => console.log(`  [${r.severity.toUpperCase()}] ${r.signal}`));
    }

    // Confidence & Recommendation
    if (result.confidence) {
      console.log(`\n📊 Confiança: ${(result.confidence * 100).toFixed(0)}%`);
    }
    if (result.recommendation) {
      console.log(`🎯 Recomendação: ${result.recommendation}`);
    }

    console.log('\n' + '─'.repeat(60));
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║     ✅ TEST PASSED! Integration is working              ║');
    console.log('╚════════════════════════════════════════════════════════════╗\n');
  } catch (error) {
    console.error('\n❌ Test error:', error);
    process.exit(1);
  }
}

// ============================================================================
// Main
// ============================================================================

testOpenAIAnalyzer()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  });
