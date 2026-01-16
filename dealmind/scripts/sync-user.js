import { PrismaClient } from '../generated/prisma/index.js';

// ID do Supabase Auth - vamos pegar dos logs ou você pode verificar no console do navegador
// O log mostra que a query busca por um ID que não existe
// Vamos verificar qual ID está sendo buscado

const db = new PrismaClient();

(async () => {
  try {
    // Primeiro, vamos listar todos os usuários para entender a situação
    console.log('=== SITUAÇÃO ATUAL ===\n');

    const users = await db.user.findMany();
    console.log('Usuários na tabela users:', users.length);
    users.forEach(u => {
      console.log(`  - ID: ${u.id}`);
      console.log(`    Email: ${u.email}`);
      console.log(`    TenantId: ${u.tenantId}`);
      console.log('');
    });

    const tenants = await db.tenant.findMany();
    console.log('Tenants na tabela tenants:', tenants.length);
    tenants.forEach(t => {
      console.log(`  - ID: ${t.id}`);
      console.log(`    Nome: ${t.name}`);
    });

    // Agora vamos deletar o usuário incorreto e mostrar como criar o correto
    console.log('\n=== PRÓXIMO PASSO ===');
    console.log('\nPara corrigir, preciso saber o ID real do Supabase Auth.');
    console.log('Abra o console do navegador (F12) e execute:');
    console.log('  await supabase.auth.getSession()');
    console.log('\nOu acesse: http://localhost:3004/dashboard/contacts/new');
    console.log('E observe os logs do servidor para ver o ID sendo buscado.');

    await db.$disconnect();
  } catch (err) {
    console.error('Erro:', err.message);
    await db.$disconnect();
    process.exit(1);
  }
})();
