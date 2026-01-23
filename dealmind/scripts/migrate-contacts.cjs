/**
 * Migration Script: Contact Fields
 *
 * This script migrates Contact fields to the new structure:
 * - name -> firstName (lastName stays null for now)
 * - phone -> landline (mobilePhone stays null unless different)
 * - notes -> internalNotes
 * - ACTIVE -> LEAD
 * - BLOCKED -> INACTIVE
 * - UNQUALIFIED -> LEAD
 */

const { PrismaClient } = require('../generated/prisma/index.js');

const prisma = new PrismaClient();

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     Contact Fields Migration Script                         ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // 1. Get all contacts
  const contacts = await prisma.contact.findMany({
    select: {
      id: true,
      name: true,
      phone: true,
      notes: true,
      status: true,
    },
  });

  console.log(`Found ${contacts.length} contacts to migrate\n`);

  let migrated = 0;
  let skipped = 0;

  // Status mapping
  const STATUS_MAP = {
    'ACTIVE': 'LEAD',
    'LEAD': 'LEAD',
    'QUALIFIED': 'QUALIFIED',
    'CLIENT': 'CLIENT',
    'INACTIVE': 'INACTIVE',
    'BLOCKED': 'INACTIVE',
    'UNQUALIFIED': 'LEAD',
  };

  for (const contact of contacts) {
    const updates = {};

    // Migrate name -> firstName
    if (contact.name && !contact.firstName) {
      updates.firstName = contact.name;
    }

    // Migrate phone -> landline
    if (contact.phone && !contact.landline) {
      updates.landline = contact.phone;
    }

    // Migrate notes -> internalNotes
    if (contact.notes && !contact.internalNotes) {
      updates.internalNotes = contact.notes;
    }

    // Migrate status if needed
    const newStatus = STATUS_MAP[contact.status];
    if (newStatus && newStatus !== contact.status) {
      updates.status = newStatus;
    }

    if (Object.keys(updates).length === 0) {
      skipped++;
      continue;
    }

    await prisma.contact.update({
      where: { id: contact.id },
      data: updates,
    });

    console.log(`✅ Contact ${contact.id}: ${Object.keys(updates).join(', ')}`);
    migrated++;
  }

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log(`║     Migration Complete!                                  ║`);
  console.log(`║     Migrated: ${migrated.toString().padStart(12)}                           ║`);
  console.log(`║     Skipped:  ${skipped.toString().padStart(12)}                           ║`);
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  await prisma.$disconnect();
}

main()
  .catch((e) => {
    console.error('\n❌ Migration failed:', e);
    process.exit(1);
  });
