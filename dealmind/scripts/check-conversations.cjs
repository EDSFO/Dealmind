const { PrismaClient } = require('../generated/prisma/index.js');

const prisma = new PrismaClient();

async function main() {
  const conversations = await prisma.conversation.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  console.log('=== Conversas no Banco ===');
  console.log(`Total: ${conversations.length}\n`);

  if (conversations.length === 0) {
    console.log('Nenhuma conversa encontrada no banco.');
    console.log('\n=> Tente criar uma conversa manual em:');
    console.log('   http://localhost:3000/dashboard/conversations/new');
  } else {
    conversations.forEach((conv, index) => {
      console.log(`\n#${index + 1} - ${conv.id}`);
      console.log(`  Tenant ID: ${conv.tenantId}`);
      console.log(`  User ID: ${conv.userId}`);
      console.log(`  Subject: ${conv.subject || '(vazio)'}`);
      console.log(`  Source: ${conv.source}`);
      console.log(`  Status: ${conv.processingStatus}`);
      console.log(`  Data: ${conv.conversationDate || '(não definida)'}`);
      console.log(`  Criado em: ${conv.createdAt}`);
      console.log(`  Tem transcrição: ${conv.transcriptionText ? 'SIM' : 'NÃO'}`);
    });
  }

  await prisma.$disconnect();
}

main()
  .catch((e) => {
    console.error('Erro:', e);
    process.exit(1);
  });
