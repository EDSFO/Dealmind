/**
 * Fix insight records where the OpenAI JSON was incorrectly stored in `summary`
 * as a string, leaving interests/objections/etc as empty arrays.
 * 
 * Run: node scripts/fix-insights.cjs
 */
const { PrismaClient } = require('../generated/prisma/index.js');
const prisma = new PrismaClient({
    log: ['error'],
});

async function main() {
    // Get ALL insights with empty arrays (no useful data)
    const insights = await prisma.insight.findMany({
        where: {
            // Has a summary (the JSON string dump) but no real data
            summary: { not: null },
        },
        select: {
            id: true,
            conversationId: true,
            summary: true,
            interests: true,
            objections: true,
            nextActions: true,
        },
    });

    console.log(`Found ${insights.length} total insights\n`);

    let fixed = 0;
    let skipped = 0;
    let failed = 0;

    for (const insight of insights) {
        const hasInterests = Array.isArray(insight.interests) && insight.interests.length > 0;
        const hasObjestions = Array.isArray(insight.objections) && insight.objections.length > 0;
        const hasActions = Array.isArray(insight.nextActions) && insight.nextActions.length > 0;

        if (hasInterests || hasObjestions || hasActions) {
            skipped++;
            continue; // already has data
        }

        // Summary must be a string with JSON content
        if (!insight.summary || typeof insight.summary !== 'string') {
            console.log(`[${insight.conversationId.substring(0, 8)}] No summary or not a string. Skipping.`);
            skipped++;
            continue;
        }

        const summaryStr = insight.summary;

        // Detect if summary contains JSON
        if (!summaryStr.includes('"interests"') && !summaryStr.includes('"summary"') && !summaryStr.includes('"objections"')) {
            console.log(`[${insight.conversationId.substring(0, 8)}] Summary is not JSON: "${summaryStr.substring(0, 60)}..."`);
            skipped++;
            continue;
        }

        console.log(`[${insight.conversationId.substring(0, 8)}] Processing... Summary preview: "${summaryStr.substring(0, 80)}..."`);

        // Extract JSON from the string (handle cases where there might be prefix text)
        let parsed = null;
        try {
            // Try direct parse first
            parsed = JSON.parse(summaryStr);
        } catch (e1) {
            // Try to find JSON object in the string
            try {
                const startIdx = summaryStr.indexOf('{');
                const endIdx = summaryStr.lastIndexOf('}');
                if (startIdx >= 0 && endIdx > startIdx) {
                    parsed = JSON.parse(summaryStr.substring(startIdx, endIdx + 1));
                }
            } catch (e2) {
                console.log(`  ✗ Cannot parse JSON: ${e2.message}`);
                failed++;
                continue;
            }
        }

        if (!parsed) {
            console.log(`  ✗ Could not extract JSON`);
            failed++;
            continue;
        }

        // Extract fields
        const interests = Array.isArray(parsed.interests) ? parsed.interests.filter(v => typeof v === 'string') : [];
        const objections = Array.isArray(parsed.objections) ? parsed.objections.filter(v => typeof v === 'string') : [];
        const commitments = Array.isArray(parsed.commitments) ? parsed.commitments.filter(v => typeof v === 'string') : [];
        const nextActions = Array.isArray(parsed.nextActions) ? parsed.nextActions.filter(v => typeof v === 'string') : [];

        const progressSignals = Array.isArray(parsed.progressSignals) ? parsed.progressSignals : [];
        // Add recommendation as a progress signal
        if (parsed.recommendation && typeof parsed.recommendation === 'string') {
            progressSignals.push({
                signal: `Recomendação: ${parsed.recommendation}`,
                confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.7,
            });
        }

        const riskSignals = Array.isArray(parsed.riskSignals) ? parsed.riskSignals : [];

        const newSummary = typeof parsed.summary === 'string' && parsed.summary.length > 0
            ? parsed.summary
            : summaryStr.substring(0, 300);

        try {
            await prisma.insight.update({
                where: { conversationId: insight.conversationId },
                data: {
                    summary: newSummary,
                    interests: interests,
                    objections: objections,
                    commitments: commitments,
                    nextActions: nextActions,
                    progressSignals: progressSignals,
                    riskSignals: riskSignals,
                },
            });

            console.log(`  ✓ Fixed! summary="${newSummary.substring(0, 60)}", interests:${interests.length}, obj:${objections.length}, actions:${nextActions.length}, risk:${riskSignals.length}`);
            fixed++;
        } catch (e) {
            console.log(`  ✗ DB update failed: ${e.message}`);
            failed++;
        }

        console.log('');
    }

    console.log(`\n====================================`);
    console.log(`Done! Fixed: ${fixed}, Skipped: ${skipped}, Failed: ${failed}`);
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
