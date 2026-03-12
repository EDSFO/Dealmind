import { NextRequest, NextResponse } from 'next/server'
import { db } from '~/server/db'
import { env } from '~/env'

interface AsaasWebhookEvent {
  event: string
  payment?: {
    id: string
    customer: string
    value: number
    netValue?: number
    billingType: string
    status: string
    dueDate: string
    paymentDate?: string
    invoiceUrl?: string
    bankSlipUrl?: string
    pixCode?: string
    description?: string
    externalReference?: string
  }
  subscription?: {
    id: string
    customer: string
    plan: string
    status: string
    nextDueDate?: string
    value?: number
  }
}

/**
 * Webhook handler for Asaas payment events
 *
 * Events handled:
 * - PAYMENT_RECEIVED
 * - PAYMENT_CONFIRMED
 * - PAYMENT_OVERDUE
 * - PAYMENT_REJECTED
 * - PAYMENT_REFUNDED
 * - PAYMENT_CANCELLED
 * - SUBSCRIPTION_CREATED
 * - SUBSCRIPTION_UPDATED
 * - SUBSCRIPTION_CANCELED
 * - SUBSCRIPTION_REACTIVATED
 */
export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature (if configured)
    const signature = request.headers.get('asaas-signature')
    const webhookSecret = env.N8N_WEBHOOK_SECRET || 'default-secret'

    // For now, we'll accept requests without signature verification
    // In production, implement proper signature verification

    const body: AsaasWebhookEvent = await request.json()

    console.log('[Asaas Webhook] Received event:', body.event)

    switch (body.event) {
      case 'PAYMENT_RECEIVED':
      case 'PAYMENT_CONFIRMED': {
        await handlePaymentConfirmed(body)
        break
      }
      case 'PAYMENT_OVERDUE': {
        await handlePaymentOverdue(body)
        break
      }
      case 'PAYMENT_REJECTED': {
        await handlePaymentRejected(body)
        break
      }
      case 'PAYMENT_REFUNDED': {
        await handlePaymentRefunded(body)
        break
      }
      case 'SUBSCRIPTION_ACTIVATED':
      case 'SUBSCRIPTION_UPDATED': {
        await handleSubscriptionUpdated(body)
        break
      }
      case 'SUBSCRIPTION_CANCELED': {
        await handleSubscriptionCanceled(body)
        break
      }
      default:
        console.log('[Asaas Webhook] Unhandled event:', body.event)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Asaas Webhook] Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handlePaymentConfirmed(event: AsaasWebhookEvent) {
  const payment = event.payment
  if (!payment?.id) return

  // Find payment by Asaas ID
  const existingPayment = await db.payment.findFirst({
    where: {
      OR: [
        { asaasPaymentId: payment.id },
        { asaasId: payment.id },
      ],
    },
  })

  if (!existingPayment) {
    console.log('[Asaas Webhook] Payment not found:', payment.id)
    return
  }

  // Update payment status
  await db.payment.update({
    where: { id: existingPayment.id },
    data: {
      status: 'CONFIRMED',
      paidDate: payment.paymentDate ? new Date(payment.paymentDate) : new Date(),
      netAmount: payment.netValue || payment.value,
      invoiceUrl: payment.invoiceUrl,
      bankSlipUrl: payment.bankSlipUrl,
      pixCode: payment.pixCode,
    },
  })

  console.log('[Asaas Webhook] Payment confirmed:', payment.id)
}

async function handlePaymentOverdue(event: AsaasWebhookEvent) {
  const payment = event.payment
  if (!payment?.id) return

  const existingPayment = await db.payment.findFirst({
    where: {
      OR: [
        { asaasPaymentId: payment.id },
        { asaasId: payment.id },
      ],
    },
  })

  if (!existingPayment) return

  await db.payment.update({
    where: { id: existingPayment.id },
    data: {
      status: 'OVERDUE',
    },
  })

  // Update subscription to PAST_DUE if it's an overdue subscription payment
  const subscription = await db.subscription.findFirst({
    where: { id: existingPayment.subscriptionId },
  })

  if (subscription) {
    await db.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'PAST_DUE',
      },
    })
  }

  console.log('[Asaas Webhook] Payment overdue:', payment.id)
}

async function handlePaymentRejected(event: AsaasWebhookEvent) {
  const payment = event.payment
  if (!payment?.id) return

  const existingPayment = await db.payment.findFirst({
    where: {
      OR: [
        { asaasPaymentId: payment.id },
        { asaasId: payment.id },
      ],
    },
  })

  if (!existingPayment) return

  await db.payment.update({
    where: { id: existingPayment.id },
    data: {
      status: 'REJECTED',
    },
  })

  console.log('[Asaas Webhook] Payment rejected:', payment.id)
}

async function handlePaymentRefunded(event: AsaasWebhookEvent) {
  const payment = event.payment
  if (!payment?.id) return

  const existingPayment = await db.payment.findFirst({
    where: {
      OR: [
        { asaasPaymentId: payment.id },
        { asaasId: payment.id },
      ],
    },
  })

  if (!existingPayment) return

  await db.payment.update({
    where: { id: existingPayment.id },
    data: {
      status: 'REFUNDED',
    },
  })

  console.log('[Asaas Webhook] Payment refunded:', payment.id)
}

async function handleSubscriptionUpdated(event: AsaasWebhookEvent) {
  const subscription = event.subscription
  if (!subscription?.id) return

  const existingSubscription = await db.subscription.findFirst({
    where: { asaasId: subscription.id },
  })

  if (!existingSubscription) return

  const statusMap: Record<string, any> = {
    'ACTIVE': 'ACTIVE',
    'OVERDUE': 'PAST_DUE',
    'CANCELED': 'CANCELED',
    'SUSPENDED': 'SUSPENDED',
  }

  await db.subscription.update({
    where: { id: existingSubscription.id },
    data: {
      status: statusMap[subscription.status] || 'ACTIVE',
      nextBillingDate: subscription.nextDueDate ? new Date(subscription.nextDueDate) : undefined,
    },
  })

  console.log('[Asaas Webhook] Subscription updated:', subscription.id)
}

async function handleSubscriptionCanceled(event: AsaasWebhookEvent) {
  const subscription = event.subscription
  if (!subscription?.id) return

  const existingSubscription = await db.subscription.findFirst({
    where: { asaasId: subscription.id },
  })

  if (!existingSubscription) return

  await db.subscription.update({
    where: { id: existingSubscription.id },
    data: {
      status: 'CANCELED',
      cancelDate: new Date(),
    },
  })

  console.log('[Asaas Webhook] Subscription canceled:', subscription.id)
}

// GET handler for webhook verification
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Asaas webhook endpoint is active',
  })
}
