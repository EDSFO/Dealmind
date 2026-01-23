/**
 * Migration Script: Pipeline Stages
 *
 * This script:
 * 1. Creates default PipelineStages for existing tenants
 * 2. Maps existing deals to new stageId based on their old stage enum
 */

const { PrismaClient } = require('../generated/prisma/index.js');

const prisma = new PrismaClient();

// Default pipeline stages for each tenant
const DEFAULT_STAGES = [
  { key: 'lead', name: 'Lead', order: 1, probability: 10, color: '#6B7280' },
  { key: 'qualification', name: 'Qualificação', order: 2, probability: 25, color: '#3B82F6' },
  { key: 'proposal', name: 'Proposta', order: 3, probability: 50, color: '#EAB308' },
  { key: 'negotiation', name: 'Negociação', order: 4, probability: 70, color: '#A855F7' },
  { key: 'closed_won', name: 'Ganho', order: 5, probability: 100, color: '#22C55E' },
  { key: 'closed_lost', name: 'Perdido', order: 6, probability: 0, color: '#EF4444' },
];

// Mapping from old DealStage enum to new PipelineStage key
const STAGE_MAPPING = {
  'LEAD': 'lead',
  'QUALIFICATION': 'qualification',
  'PROPOSAL': 'proposal',
  'NEGOTIATION': 'negotiation',
  'CLOSED_WON': 'closed_won',
  'CLOSED_LOST': 'closed_lost',
};

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     Pipeline Stages Migration Script                         ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // 1. Get all tenants
  const tenants = await prisma.tenant.findMany({
    select: { id: true, name: true },
  });

  console.log(`Found ${tenants.length} tenants\n`);

  let totalStagesCreated = 0;
  let totalDealsUpdated = 0;

  for (const tenant of tenants) {
    console.log(`\n📦 Processing tenant: ${tenant.name} (${tenant.id})`);

    // 2. Check if tenant already has PipelineStages
    const existingStages = await prisma.pipelineStage.findMany({
      where: { tenantId: tenant.id },
    });

    if (existingStages.length > 0) {
      console.log(`   ✅ Already has ${existingStages.length} pipeline stages, skipping creation`);

      // Get stage mapping for this tenant
      const stageMap = new Map(existingStages.map(s => [s.key, s.id]));

      // 3. Update deals that don't have stageId yet
      const dealsWithoutStage = await prisma.deal.findMany({
        where: {
          tenantId: tenant.id,
          stageId: null,
        },
        select: { id: true, title: true },
      });

      if (dealsWithoutStage.length > 0) {
        // For deals without stageId, use the first stage (usually 'lead')
        const firstStage = existingStages.sort((a, b) => a.order - b.order)[0];

        await prisma.deal.updateMany({
          where: {
            id: { in: dealsWithoutStage.map(d => d.id) },
          },
          data: { stageId: firstStage.id },
        });

        console.log(`   ✅ Updated ${dealsWithoutStage.length} deals to default stage "${firstStage.name}"`);
        totalDealsUpdated += dealsWithoutStage.length;
      }

      continue;
    }

    // 3. Create default PipelineStages for tenant
    console.log(`   Creating ${DEFAULT_STAGES.length} default pipeline stages...`);

    const stages = await prisma.pipelineStage.createMany({
      data: DEFAULT_STAGES.map(stage => ({
        tenantId: tenant.id,
        ...stage,
      })),
      skipDuplicates: true,
    });

    totalStagesCreated += DEFAULT_STAGES.length;

    // Fetch created stages to get their IDs
    const createdStages = await prisma.pipelineStage.findMany({
      where: { tenantId: tenant.id },
      orderBy: { order: 'asc' },
    });

    console.log(`   ✅ Created ${createdStages.length} pipeline stages:`);
    createdStages.forEach(s => {
      console.log(`      - ${s.name} (${s.key})`);
    });

    // 4. Update all deals for this tenant with new stageId
    const deals = await prisma.deal.findMany({
      where: { tenantId: tenant.id },
      select: { id: true, title: true, stage: true },
    });

    console.log(`   Found ${deals.length} deals to update`);

    for (const deal of deals) {
      if (!deal.stage) {
        // Deal doesn't have a stage set (shouldn't happen with schema, but handle it)
        const firstStage = createdStages[0];
        await prisma.deal.update({
          where: { id: deal.id },
          data: { stageId: firstStage.id },
        });
        console.log(`      ✅ Deal "${deal.title}" → default stage "${firstStage.name}"`);
        totalDealsUpdated++;
        continue;
      }

      const newStageKey = STAGE_MAPPING[deal.stage];
      if (!newStageKey) {
        console.log(`      ⚠️  Deal "${deal.title}" has unknown stage "${deal.stage}", skipping`);
        continue;
      }

      const newStage = createdStages.find(s => s.key === newStageKey);
      if (!newStage) {
        console.log(`      ⚠️  Could not find stage for "${deal.stage}", skipping`);
        continue;
      }

      await prisma.deal.update({
        where: { id: deal.id },
        data: { stageId: newStage.id },
      });

      console.log(`      ✅ Deal "${deal.title}" → ${newStage.name}`);
      totalDealsUpdated++;
    }
  }

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log(`║     Migration Complete!                                  ║`);
  console.log(`║     Pipeline Stages Created: ${totalStagesCreated.toString().padStart(4)}                      ║`);
  console.log(`║     Deals Updated: ${totalDealsUpdated.toString().padStart(9)}                             ║`);
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  await prisma.$disconnect();
}

main()
  .catch((e) => {
    console.error('\n❌ Migration failed:', e);
    process.exit(1);
  });
