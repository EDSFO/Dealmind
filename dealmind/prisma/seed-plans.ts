import { PrismaClient } from '../generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('Creating default plans...')

  // First, get or create a default tenant
  let defaultTenant = await prisma.tenant.findFirst({
    where: { name: 'default' },
  })

  if (!defaultTenant) {
    defaultTenant = await prisma.tenant.create({
      data: {
        id: 'default',
        name: 'Default',
      },
    })
    console.log('Created default tenant')
  }

  // Create default plans (these will be used for new tenants)
  const plans = [
    {
      id: 'plan-free',
      tenantId: 'default', // Will be replaced per tenant
      name: 'Gratuito',
      description: 'Perfeito para começar',
      priceMonthly: 0,
      priceYearly: 0,
      maxUsers: 1,
      maxContacts: 100,
      maxDeals: 20,
      maxConversations: 50,
      maxStorageGB: 0.5,
      isActive: true,
      isDefault: true,
      features: JSON.stringify([
        'Dashboard básico',
        'Até 100 contatos',
        'Até 20 negócios',
        '50 conversas/mês',
        'Suporte por email',
      ]),
    },
    {
      id: 'plan-pro',
      tenantId: 'default',
      name: 'Pro',
      description: 'Para equipes que querem crescer',
      priceMonthly: 97,
      priceYearly: 970,
      maxUsers: 5,
      maxContacts: 1000,
      maxDeals: 200,
      maxConversations: 500,
      maxStorageGB: 5,
      isActive: true,
      isDefault: false,
      features: JSON.stringify([
        'Dashboard completo',
        'Até 1.000 contatos',
        'Negócios ilimitados',
        '500 conversas/mês',
        'Análise de IA',
        'Integrações (WhatsApp, Email)',
        'Suporte prioritário',
      ]),
    },
    {
      id: 'plan-enterprise',
      tenantId: 'default',
      name: 'Enterprise',
      description: 'Solução completa para grandes equipes',
      priceMonthly: 297,
      priceYearly: 2970,
      maxUsers: 999,
      maxContacts: 999999,
      maxDeals: 999999,
      maxConversations: 999999,
      maxStorageGB: 100,
      isActive: true,
      isDefault: false,
      features: JSON.stringify([
        'Tudo do Pro',
        'Usuários ilimitados',
        'Contatos ilimitados',
        'Conversas ilimitadas',
        '100GB armazenamento',
        'API completa',
        'Dedicated account manager',
        'SLA garantido',
        'Treinamento incluso',
      ]),
    },
  ]

  for (const plan of plans) {
    // Use the default tenant ID
    const planData = {
      ...plan,
      tenantId: defaultTenant.id,
    }

    await prisma.plan.upsert({
      where: { id: plan.id },
      update: planData,
      create: planData,
    })
    console.log(`Created/updated plan: ${plan.name}`)
  }

  console.log('Default plans created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
