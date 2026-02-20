/**
 * Script to reprocess all FAILED or PENDING conversations through OpenAI
 * Run with: node scripts/reprocess-insights.mjs
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { PrismaClient } = require('../generated/prisma/index.js');

const prisma = new PrismaClient();

async function main() {
    // Find all conversations that have an insight but empty arrays (wrongly parsed)
    const conversations = await prisma.conversation.findMany({
        where: {
            processingStatus: { in: ['COMPLETED', 'FAILED'] },
            transcriptionText: { not: null },
        },
        include: {
            insight: true,
        },
        orderBy: { updatedAt: 'desc' },
        take: 20,
    });

    console.log(`Found ${conversations.length} conversations to check\n`);

    for (const conv of conversations) {
        const insight = conv.insight;
        const hasData = insight && (
            (insight.interests?.length > 0) ||
            (insight.objections?.length > 0) ||
            (insight.nextActions?.length > 0) ||
            (insight.commitments?.length > 0)
        );

        const summaryLooksLikeJson = insight?.summary && (
            insight.summary.trim().startsWith('{') ||
            insight.summary.includes('"interests"') ||
            insight.summary.includes('"objections"')
        );

        console.log(`[${conv.id.substring(0, 8)}] "${conv.subject || 'Sem assunto'}":`);
        console.log(`  Status: ${conv.processingStatus}`);
        console.log(`  Has insight: ${!!insight}`);
        console.log(`  Has data: ${hasData}`);
        console.log(`  Summary is JSON: ${summaryLooksLikeJson}`);

        if (summaryLooksLikeJson && !hasData) {
            // Parse the JSON from summary and update the insight record
            try {
                const jsonStr = insight.summary.trim();
                const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                    console.log(`  → Reparsing JSON from summary...`);

                    await prisma.insight.update({
                        where: { conversationId: conv.id },
                        data: {
                            summary: parsed.summary || insight.summary,
                            interests: parsed.interests || [],
                            objections: parsed.objections || [],
                            commitments: parsed.commitments || [],
                            nextActions: parsed.nextActions || [],
                            progressSignals: parsed.progressSignals || [],
                            riskSignals: parsed.riskSignals || [],
                        }
                    });

                    console.log(`  ✓ Updated insight for conversation ${conv.id.substring(0, 8)}`);
                    console.log(`    interests: ${parsed.interests?.length || 0} items`);
                    console.log(`    objections: ${parsed.objections?.length || 0} items`);
                    console.log(`    nextActions: ${parsed.nextActions?.length || 0} items`);
                }
            } catch (e) {
                console.log(`  ✗ Failed to parse summary JSON: ${e.message}`);
            }
        } else if (!hasData && conv.processingStatus === 'FAILED') {
            console.log(`  → Marking for retry...`);
            await prisma.conversation.update({
                where: { id: conv.id },
                data: { processingStatus: 'PENDING' }
            });
        }

        console.log('');
    }

    console.log('Done!');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
