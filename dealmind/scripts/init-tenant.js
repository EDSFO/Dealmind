import { PrismaClient } from '../generated/prisma/index.js';
const db = new PrismaClient();

(async () => {
  try {
    // Email do usuário autenticado (baseado nos logs)
    const userEmail = 'erickdouglasoliveira74@gmail.com';
    const userId = 'erickdouglasoliveira74'; // ID do Supabase Auth

    console.log('=== Criando Tenant e Usuário ===\n');

    // 1. Criar tenant
    const tenant = await db.tenant.create({
      data: {
        id: 'default-tenant',
        name: 'DealMind Default',
      },
    });
    console.log('✓ Tenant criado:', tenant.id, '-', tenant.name);

    // 2. Criar usuário
    const user = await db.user.create({
      data: {
        id: userId,
        email: userEmail,
        name: 'Erick Douglas',
        tenantId: tenant.id,
        role: 'ADMIN',
      },
    });
    console.log('✓ Usuário criado:', user.id, '-', user.name);
    console.log('  Email:', user.email);
    console.log('  TenantId:', user.tenantId);
    console.log('  Role:', user.role);

    console.log('\n=== Inicialização concluída! ===');
    console.log('\nAgora você pode criar contatos normalmente.');

    await db.$disconnect();
  } catch (err) {
    console.error('Erro:', err.message);
    if (err.meta) {
      console.error('Detalhes:', JSON.stringify(err.meta, null, 2));
    }
    await db.$disconnect();
    process.exit(1);
  }
})();
