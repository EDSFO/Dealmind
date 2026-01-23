const { PrismaClient } = require('../generated/prisma/index.js');

const prisma = new PrismaClient();

async function main() {
  // Buscar o primeiro tenant e user
  const user = await prisma.user.findFirst();

  if (!user) {
    console.log('❌ Nenhum usuário encontrado no banco.');
    await prisma.$disconnect();
    return;
  }

  console.log('✅ Usuário encontrado:', user.email);
  console.log('   Tenant ID:', user.tenantId);
  console.log('   User ID:', user.id);
  console.log('   Role:', user.role);

  // Tentar criar uma conversa de teste
  try {
    const conversation = await prisma.conversation.create({
      data: {
        tenantId: user.tenantId,
        userId: user.id,
        subject: 'Teste de Conversa',
        source: 'MANUAL',
        transcriptionText: 'Esta é uma transcrição de teste.',
        participants: ['João', 'Maria'],
        conversationDate: new Date(),
        processingStatus: 'PENDING',
      }
    });

    console.log('\n✅ Conversa criada com sucesso!');
    console.log('   ID:', conversation.id);
    console.log('   Subject:', conversation.subject);
    console.log('   Source:', conversation.source);
    console.log('   Status:', conversation.processingStatus);

  } catch (error) {
    console.error('\n❌ Erro ao criar conversa:');
    console.error(error);
  }

  await prisma.$disconnect();
}

main()
  .catch((e) => {
    console.error('Erro:', e);
    process.exit(1);
  });
