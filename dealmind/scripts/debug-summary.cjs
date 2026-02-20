const { PrismaClient } = require('../generated/prisma/index.js');
const prisma = new PrismaClient({ log: ['error'] });

async function main() {
    const insights = await prisma.insight.findMany({
        select: { conversationId: true, summary: true, interests: true },
    });

    for (const insight of insights) {
        const hasData = Array.isArray(insight.interests) && insight.interests.length > 0;
        if (hasData) continue;
        if (!insight.summary || typeof insight.summary !== 'string') continue;

        const s = insight.summary;
        console.log(`\n===== [${insight.conversationId.substring(0, 8)}] =====`);
        console.log(`Length: ${s.length}`);
        console.log(`First 30 chars (codes): ${[...s.substring(0, 30)].map(c => c.charCodeAt(0)).join(',')}`);
        console.log(`Content:\n${s.substring(0, 600)}`);
        console.log(`---`);

        // Try every parse approach
        try {
            JSON.parse(s);
            console.log('DIRECT PARSE: SUCCESS');
        } catch (e) {
            console.log(`DIRECT PARSE FAILED: ${e.message}`);
        }

        try {
            const si = s.indexOf('{');
            const ei = s.lastIndexOf('}');
            if (si >= 0 && ei > si) {
                const sub = s.substring(si, ei + 1);
                JSON.parse(sub);
                console.log(`SUBSTRING PARSE: SUCCESS (from ${si} to ${ei})`);
            } else {
                console.log(`No {} found (si=${si}, ei=${ei})`);
            }
        } catch (e) {
            console.log(`SUBSTRING PARSE FAILED: ${e.message}`);
        }
    }

    console.log('\nDone.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
