import { db } from '~/server/db'
import { TRPCError } from '@trpc/server'

/**
 * Check if tenant has reached plan limits
 */
export async function checkPlanLimits(
  tenantId: string,
  resource: 'deals' | 'contacts' | 'conversations' | 'users' | 'storage'
) {
  // Get current subscription
  const subscription = await db.subscription.findFirst({
    where: {
      tenantId,
      status: 'ACTIVE',
    },
    include: {
      plan: true,
    },
  })

  // If no subscription, use free limits
  const limits = subscription?.plan || {
    maxDeals: 20,
    maxContacts: 100,
    maxConversations: 50,
    maxUsers: 1,
    maxStorageGB: 0.5,
  }

  // Get current usage
  let currentCount = 0
  let limit = 0
  let unit = ''

  switch (resource) {
    case 'deals':
      currentCount = await db.deal.count({ where: { tenantId } })
      limit = limits.maxDeals
      unit = 'negócios'
      break
    case 'contacts':
      currentCount = await db.contact.count({ where: { tenantId } })
      limit = limits.maxContacts
      unit = 'contatos'
      break
    case 'conversations':
      currentCount = await db.conversation.count({ where: { tenantId } })
      limit = limits.maxConversations
      unit = 'conversas'
      break
    case 'users':
      currentCount = await db.user.count({ where: { tenantId } })
      limit = limits.maxUsers
      unit = 'usuários'
      break
    default:
      return { allowed: true }
  }

  // Check if at limit
  if (currentCount >= limit) {
    const planName = subscription?.plan?.name || 'Gratuito'
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: `Você atingiu o limite do plano ${planName}. Faça upgrade para continuar usando. Limite: ${limit} ${unit}`,
    })
  }

  return { allowed: true, current: currentCount, limit }
}

/**
 * Get current usage statistics
 */
export async function getUsageStats(tenantId: string) {
  const subscription = await db.subscription.findFirst({
    where: {
      tenantId,
      status: 'ACTIVE',
    },
    include: {
      plan: true,
    },
  })

  const limits = subscription?.plan || {
    name: 'Gratuito',
    maxDeals: 20,
    maxContacts: 100,
    maxConversations: 50,
    maxUsers: 1,
    maxStorageGB: 0.5,
  }

  const [dealsCount, contactsCount, conversationsCount, usersCount] = await Promise.all([
    db.deal.count({ where: { tenantId } }),
    db.contact.count({ where: { tenantId } }),
    db.conversation.count({ where: { tenantId } }),
    db.user.count({ where: { tenantId } }),
  ])

  return {
    plan: limits.name,
    deals: { current: dealsCount, limit: limits.maxDeals },
    contacts: { current: contactsCount, limit: limits.maxContacts },
    conversations: { current: conversationsCount, limit: limits.maxConversations },
    users: { current: usersCount, limit: limits.maxUsers },
  }
}
