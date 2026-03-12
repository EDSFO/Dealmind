import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '~/server/api/trpc'
import { TRPCError } from '@trpc/server'
import { asaas, mapAsaasStatus, mapPaymentMethod } from '~/server/lib/asaas'
import { db } from '~/server/db'
import { ensureUser } from '~/server/lib/user'
import { getUsageStats } from '~/server/lib/plan-limits'

export const subscriptionRouter = createTRPCRouter({
  // ============================================
  // READ OPERATIONS
  // ============================================

  /**
   * Listar planos disponíveis
   */
  listPlans: protectedProcedure.query(async ({ ctx }) => {
    try {
      if (!ctx.db) {
        console.error('[subscription.listPlans] ctx.db is undefined')
        return []
      }
      const { db, session } = ctx

      const user = await ensureUser(db, session)
      if (!user?.tenantId) {
        return []
      }

      // Get plans for this tenant (or default plans)
      const plans = await db.plan.findMany({
        where: {
          OR: [
            { tenantId: user.tenantId },
            { isDefault: true }
          ],
          isActive: true,
        },
        orderBy: { priceMonthly: 'asc' },
      })

      return plans
    } catch (error) {
      console.error('[subscription.listPlans] Error:', error)
      return []
    }
  }),

  /**
   * Buscar assinatura atual do tenant
   */
  getCurrent: protectedProcedure.query(async ({ ctx }) => {
    try {
      if (!ctx.db) {
        console.error('[subscription.getCurrent] ctx.db is undefined')
        return null
      }
      const { db, session } = ctx

      const user = await ensureUser(db, session)
      if (!user?.tenantId) {
        return null
      }

      const subscription = await db.subscription.findFirst({
        where: {
          tenantId: user.tenantId,
          status: 'ACTIVE',
        },
        include: {
          plan: true,
        },
        orderBy: { createdAt: 'desc' },
      })

      if (!subscription) {
        return null
      }

      // Get recent payments
      const recentPayments = await db.payment.findMany({
        where: {
          subscriptionId: subscription.id,
        },
        orderBy: { dueDate: 'desc' },
        take: 5,
      })

      return {
        ...subscription,
        recentPayments,
      }
    } catch (error) {
      console.error('[subscription.getCurrent] Error:', error)
      return null
    }
  }),

  /**
   * Buscar histórico de pagamentos
   */
  getPayments: protectedProcedure.query(async ({ ctx }) => {
    try {
      if (!ctx.db) {
        return []
      }
      const { db, session } = ctx

      const user = await ensureUser(db, session)
      if (!user?.tenantId) {
        return []
      }

      const subscription = await db.subscription.findFirst({
        where: {
          tenantId: user.tenantId,
        },
      })

      if (!subscription) {
        return []
      }

      return db.payment.findMany({
        where: {
          subscriptionId: subscription.id,
        },
        orderBy: { dueDate: 'desc' },
      })
    } catch (error) {
      console.error('[subscription.getPayments] Error:', error)
      return []
    }
  }),

  // ============================================
  // WRITE OPERATIONS
  // ============================================

  /**
   * Criar assinatura (iniciar trial ou plano)
   */
  create: protectedProcedure
    .input(
      z.object({
        planId: z.string(),
        billingCycle: z.enum(['MONTHLY', 'YEARLY']),
        paymentMethod: z.enum(['CREDIT_CARD', 'BOLETO', 'PIX']),
        customerData: z.object({
          name: z.string(),
          email: z.string().email(),
          cpfCnpj: z.string().optional(),
          phone: z.string().optional(),
        }).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx

      const user = await ensureUser(db, session)
      const tenantId = user.tenantId

      // Get plan
      const plan = await db.plan.findUnique({
        where: { id: input.planId },
      })

      if (!plan || !plan.isActive) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Plano não encontrado',
        })
      }

      // Calculate price based on billing cycle
      const price = input.billingCycle === 'MONTHLY'
        ? Number(plan.priceMonthly)
        : Number(plan.priceYearly)

      // Get or create customer in Asaas
      let asaasCustomerId = ''

      // Try to find existing subscription for customer info
      const existingSubscription = await db.subscription.findFirst({
        where: { tenantId },
        include: { tenant: true },
      })

      if (existingSubscription?.asaasCustomerId) {
        asaasCustomerId = existingSubscription.asaasCustomerId
      } else {
        // Create customer in Asaas
        const customerData = input.customerData || {
          name: user.name || 'Customer',
          email: session.user.email || '',
        }

        try {
          const asaasCustomer = await asaas.createCustomer({
            name: customerData.name,
            email: customerData.email,
            cpfCnpj: customerData.cpfCnpj,
            phone: customerData.phone,
            externalReference: tenantId,
          })

          if (asaasCustomer.id) {
            asaasCustomerId = asaasCustomer.id
          }
        } catch (error) {
          console.error('Error creating Asaas customer:', error)
          // Continue without Asaas ID for now
        }
      }

      // Calculate next billing date
      const now = new Date()
      const nextBillingDate = new Date(now)
      if (input.billingCycle === 'MONTHLY') {
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1)
      } else {
        nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1)
      }

      // Create subscription in database
      const subscription = await db.subscription.create({
        data: {
          tenantId,
          planId: plan.id,
          userId: session.user.id,
          asaasCustomerId: asaasCustomerId || null,
          status: 'ACTIVE',
          startDate: now,
          nextBillingDate,
          amount: price,
          billingCycle: input.billingCycle,
        },
      })

      // If Asaas is configured, create subscription there too
      if (asaasCustomerId && plan.asaasPlanId) {
        try {
          await asaas.createSubscription({
            customer: asaasCustomerId,
            plan: plan.asaasPlanId,
            billingType: input.paymentMethod as 'CREDIT_CARD' | 'BOLETO' | 'PIX',
            nextDueDate: nextBillingDate.toISOString().split('T')[0] as string,
            value: price,
            description: `Assinatura ${plan.name}`,
          })
        } catch (error) {
          console.error('Error creating Asaas subscription:', error)
        }
      }

      return subscription
    }),

  /**
   * Cancelar assinatura
   */
  cancel: protectedProcedure.mutation(async ({ ctx }) => {
    const { db, session } = ctx

    const user = await ensureUser(db, session)

    const subscription = await db.subscription.findFirst({
      where: {
        tenantId: user.tenantId,
        status: 'ACTIVE',
      },
    })

    if (!subscription) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Nenhuma assinatura ativa encontrada',
      })
    }

    // Cancel in Asaas if exists
    if (subscription.asaasId) {
      try {
        await asaas.cancelSubscription(subscription.asaasId)
      } catch (error) {
        console.error('Error canceling Asaas subscription:', error)
      }
    }

    // Update in database
    return db.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'CANCELED',
        cancelDate: new Date(),
      },
    })
  }),

  /**
   * Criar cobrança avulsa (para teste ou pagamento único)
   */
  createPayment: protectedProcedure
    .input(
      z.object({
        amount: z.number().min(1),
        description: z.string().optional(),
        paymentMethod: z.enum(['CREDIT_CARD', 'BOLETO', 'PIX']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx

      const user = await ensureUser(db, session)

      const subscription = await db.subscription.findFirst({
        where: {
          tenantId: user.tenantId,
          status: 'ACTIVE',
        },
      })

      if (!subscription) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Nenhuma assinatura ativa encontrada',
        })
      }

      // Calculate due date (10 days from now for boleto, immediate for PIX/card)
      const dueDate = new Date()
      if (input.paymentMethod === 'BOLETO') {
        dueDate.setDate(dueDate.getDate() + 10)
      }

      // Create payment in Asaas
      let asaasPaymentId: string | null = null

      if (subscription.asaasCustomerId) {
        try {
          const asaasPayment = await asaas.createPayment({
            customer: subscription.asaasCustomerId,
            billingType: input.paymentMethod as 'CREDIT_CARD' | 'BOLETO' | 'PIX',
            value: input.amount,
            dueDate: dueDate.toISOString().split('T')[0] as string,
            description: input.description || 'Cobrança DealMind',
            externalReference: subscription.id,
          })

          if (asaasPayment.id) {
            asaasPaymentId = asaasPayment.id
          }
        } catch (error) {
          console.error('Error creating Asaas payment:', error)
        }
      }

      // Create payment record in database
      const payment = await db.payment.create({
        data: {
          subscriptionId: subscription.id,
          tenantId: user.tenantId,
          asaasPaymentId,
          amount: input.amount,
          netAmount: input.amount, // Will be updated by webhook
          paymentMethod: input.paymentMethod,
          status: 'PENDING',
          dueDate,
          description: input.description,
        },
      })

      return payment
    }),
})

// ============================================
// WEBHOOK HANDLER (separate route file)
// ============================================
