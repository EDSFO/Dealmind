import { env } from '~/env'

interface AsaasCustomer {
  id?: string
  name: string
  email: string
  cpfCnpj?: string
  phone?: string
  externalReference?: string
}

interface AsaasSubscription {
  id?: string
  customer: string
  plan: string
  billingType: 'CREDIT_CARD' | 'BOLETO' | 'PIX'
  nextDueDate: string
  value?: number
  description?: string
}

interface AsaasPayment {
  id?: string
  customer: string
  billingType: 'CREDIT_CARD' | 'BOLETO' | 'PIX'
  value: number
  dueDate: string
  description?: string
  externalReference?: string
}

interface AsaasResponse<T> {
  id?: string
  errors?: Array<{ code: string; description: string }>
  [key: string]: any
}

export class AsaasClient {
  private apiKey: string
  private baseUrl: string

  constructor() {
    // Use environment variable or fallback to test key
    this.apiKey = process.env.ASAAS_API_KEY || '$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmZmYzZhMThhLWY2NjktNDg0Yy1iN2MzLTFkMTFhMDA1NjZmMTo6JGFhY2hfYjg3OGExYWQtYWYxOS00MDQwLWExMjgtNDRkMjEwZmIwNzMy'
    this.baseUrl = env.NODE_ENV === 'production'
      ? 'https://www.asaas.com/api/v3'
      : 'https://sandbox.asaas.com/api/v3'
  }

  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'access_token': this.apiKey,
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.errors?.[0]?.description || `Asaas API Error: ${response.status}`)
    }

    return response.json()
  }

  // ============================================
  // CUSTOMERS (Clientes)
  // ============================================

  /**
   * Criar cliente no Asaas
   */
  async createCustomer(data: AsaasCustomer): Promise<AsaasResponse<AsaasCustomer>> {
    return this.request('/customers', 'POST', data)
  }

  /**
   * Buscar cliente por ID
   */
  async getCustomer(customerId: string): Promise<AsaasResponse<AsaasCustomer>> {
    return this.request(`/customers/${customerId}`)
  }

  /**
   * Buscar cliente por email
   */
  async getCustomerByEmail(email: string): Promise<AsaasResponse<AsaasCustomer>> {
    return this.request(`/customers?email=${encodeURIComponent(email)}`)
  }

  /**
   * Atualizar cliente
   */
  async updateCustomer(customerId: string, data: Partial<AsaasCustomer>): Promise<AsaasResponse<AsaasCustomer>> {
    return this.request(`/customers/${customerId}`, 'PUT', data)
  }

  // ============================================
  // PLANS (Planos)
  // ============================================

  /**
   * Criar plano de assinatura
   */
  async createPlan(data: {
    name: string
    description?: string
    amount: number
    billingType: 'CREDIT_CARD' | 'BOLETO' | 'PIX'
    interval: 'WEEKLY' | 'MONTHLY' | 'YEARLY'
    duration?: number
  }): Promise<AsaasResponse<any>> {
    return this.request('/plans', 'POST', data)
  }

  /**
   * Buscar plano por ID
   */
  async getPlan(planId: string): Promise<AsaasResponse<any>> {
    return this.request(`/plans/${planId}`)
  }

  /**
   * Listar planos
   */
  async listPlans(): Promise<AsaasResponse<any>> {
    return this.request('/plans')
  }

  // ============================================
  // SUBSCRIPTIONS (Assinaturas)
  // ============================================

  /**
   * Criar assinatura
   */
  async createSubscription(data: AsaasSubscription): Promise<AsaasResponse<AsaasSubscription>> {
    return this.request('/subscriptions', 'POST', data)
  }

  /**
   * Buscar assinatura por ID
   */
  async getSubscription(subscriptionId: string): Promise<AsaasResponse<AsaasSubscription>> {
    return this.request(`/subscriptions/${subscriptionId}`)
  }

  /**
   * Cancelar assinatura
   */
  async cancelSubscription(subscriptionId: string): Promise<AsaasResponse<any>> {
    return this.request(`/subscriptions/${subscriptionId}`, 'DELETE')
  }

  /**
   * Reativar assinatura
   */
  async reactivateSubscription(subscriptionId: string): Promise<AsaasResponse<any>> {
    return this.request(`/subscriptions/${subscriptionId}`, 'POST', {
      status: 'ACTIVE'
    })
  }

  // ============================================
  // PAYMENTS (Cobranças)
  // ============================================

  /**
   * Criar cobrança
   */
  async createPayment(data: AsaasPayment): Promise<AsaasResponse<AsaasPayment>> {
    return this.request('/payments', 'POST', data)
  }

  /**
   * Buscar cobrança por ID
   */
  async getPayment(paymentId: string): Promise<AsaasResponse<AsaasPayment>> {
    return this.request(`/payments/${paymentId}`)
  }

  /**
   * Listar cobranças de um cliente
   */
  async listPayments(customerId: string): Promise<AsaasResponse<any>> {
    return this.request(`/payments?customer=${customerId}`)
  }

  /**
   * Cancelar cobrança
   */
  async cancelPayment(paymentId: string): Promise<AsaasResponse<any>> {
    return this.request(`/payments/${paymentId}`, 'DELETE')
  }

  /**
   * Gerar PIX ou Boleto
   */
  async getPaymentLink(paymentId: string): Promise<AsaasResponse<any>> {
    return this.request(`/payments/${paymentId}`, 'GET')
  }

  // ============================================
  // WEBHOOKS
  // ============================================

  /**
   * Listar webhooks
   */
  async listWebhooks(): Promise<AsaasResponse<any>> {
    return this.request('/webhooks')
  }

  /**
   * Criar webhook
   */
  async createWebhook(data: {
    url: string
    email: string
    events: string[]
    enabled: boolean
  }): Promise<AsaasResponse<any>> {
    return this.request('/webhooks', 'POST', data)
  }
}

// Export singleton instance
export const asaas = new AsaasClient()

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Mapear status do Asaas para status interno
 */
export function mapAsaasStatus(asaasStatus: string): string {
  // Subscription statuses
  const subStatusMap: Record<string, string> = {
    'ACTIVE': 'ACTIVE',
    'OVERDUE': 'PAST_DUE',
    'CANCELED': 'CANCELED',
    'SUSPENDED': 'SUSPENDED',
    'EXPIRED': 'EXPIRED',
  }
  if (subStatusMap[asaasStatus]) {
    return subStatusMap[asaasStatus]
  }

  // Payment statuses
  const payStatusMap: Record<string, string> = {
    'PENDING': 'PENDING',
    'CONFIRMED': 'RECEIVED',
    'RECEIVED': 'RECEIVED',
    'OVERDUE': 'OVERDUE',
    'REJECTED': 'REJECTED',
    'REFUNDED': 'REFUNDED',
    'CANCELLED': 'CANCELLED',
  }
  return payStatusMap[asaasStatus] || 'PENDING'
}

/**
 * Mapear método de pagamento
 */
export function mapPaymentMethod(asaasMethod: string): string {
  const methodMap: Record<string, string> = {
    'CREDIT_CARD': 'CREDIT_CARD',
    'BOLETO': 'BOLETO',
    'PIX': 'PIX',
    'DEBIT_CARD': 'DEBIT_CARD',
  }
  return methodMap[asaasMethod] || 'CREDIT_CARD'
}
