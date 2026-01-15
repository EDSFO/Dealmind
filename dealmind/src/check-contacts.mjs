import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const contacts = await prisma.contact.findMany({
    take: 10,
    select: { id: true, name: true, tenantId: true, createdAt: true }
  })

  console.log('Contacts found:', contacts.length)
  console.log(JSON.stringify(contacts, null, 2))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
