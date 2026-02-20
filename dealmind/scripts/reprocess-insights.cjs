const { PrismaClient } = require('../generated/prisma/index.js');
const prisma = new PrismaClient();

async function main() {
    const conversations = await prisma.conversation.findMany({
        where: { transcriptionText: { not: null } },
        include: { insight: true },
        orderBy: { updatedAt: 'desc' },
        take: 30,
    });

    console.log(`Found ${conversations.length} conversations\n`);
    let fixed = 0;

    for (const conv of conversations) {
        const insight = conv.insight;
        if (!insight) continue;

        const hasInterests = Array.isArray(insight.interests) && insight.interests.length > 0;
        const hasObjestions = Array.isArray(insight.objections) && insight.objections.length > 0;
        const hasActions = Array.isArray(insight.nextActions) && insight.nextActions.length > 0;
        const hasData = hasInterests || hasObjestions || hasActions;

        if (hasData) {
            console.log(`[${conv.id.substring(0, 8)}] OK - already has data`);
            continue;
        }

        // Check if summary contains the full analysis JSON
        let parsedFromSummary = null;
        const summary = insight.summary;

        if (summary && typeof summary === 'object') {
            // Prisma JSON field - already an object
            const summaryObj = summary;
            if (summaryObj.interests || summaryObj.objections || summaryObj.nextActions) {
                parsedFromSummary = summaryObj;
                console.log(`[${conv.id.substring(0, 8)}] Summary is JSON object with fields: ${Object.keys(summaryObj).join(', ')}`);
            }
        } else if (summary && typeof summary === 'string') {
            try {
                const startIdx = summary.indexOf('{');
                const endIdx = summary.lastIndexOf('}');
                if (startIdx >= 0 && endIdx > startIdx) {
                    const jsonStr = summary.substring(startIdx, endIdx + 1);
                    parsedFromSummary = JSON.parse(jsonStr);
                    console.log(`[${conv.id.substring(0, 8)}] Summary is JSON string with fields: ${Object.keys(parsedFromSummary).join(', ')}`);
                }
            } catch (e) {
                console.log(`[${conv.id.substring(0, 8)}] Summary not JSON: ${String(summary).substring(0, 100)}`);
            }
        } else {
            console.log(`[${conv.id.substring(0, 8)}] No summary`);
        }

        if (parsedFromSummary) {
            const interests = Array.isArray(parsedFromSummary.interests) ? parsedFromSummary.interests : [];
            const objections = Array.isArray(parsedFromSummary.objections) ? parsedFromSummary.objections : [];
            const commitments = Array.isArray(parsedFromSummary.commitments) ? parsedFromSummary.commitments : [];
            const nextActions = Array.isArray(parsedFromSummary.nextActions) ? parsedFromSummary.nextActions : [];
            const progressSignals = Array.isArray(parsedFromSummary.progressSignals) ? parsedFromSummary.progressSignals : [];
            const riskSignals = Array.isArray(parsedFromSummary.riskSignals) ? parsedFromSummary.riskSignals : [];
            const newSummary = typeof parsedFromSummary.summary === 'string'
                ? parsedFromSummary.summary
                : `Insights extraídos automaticamente`;

            await prisma.insight.update({
                where: { conversationId: conv.id },
                data: {
                    summary: newSummary,
                    interests: interests,
                    objections: objections,
                    commitments: commitments,
                    nextActions: nextActions,
                    progressSignals: progressSignals.length > 0 ? progressSignals : undefined,
                    riskSignals: riskSignals.length > 0 ? riskSignals : undefined,
                }
            });

            console.log(`  ✓ FIXED! interests:${interests.length} obj:${objections.length} actions:${nextActions.length} risk:${riskSignals.length}`);
            fixed++;
        }
    }

    console.log(`\nDone! Fixed ${fixed} conversations.`);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
