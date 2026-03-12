'use client'

import { useState } from 'react'
import { api } from '~/trpc/react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Check, CreditCard, Barcode, QrCode, Loader2, AlertCircle } from 'lucide-react'

export default function SubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY')
  const [paymentMethod, setPaymentMethod] = useState<'CREDIT_CARD' | 'BOLETO' | 'PIX'>('PIX')

  const { data: subscription, isLoading: subLoading, refetch } = api.subscription.getCurrent.useQuery()
  const { data: plans, isLoading: plansLoading } = api.subscription.listPlans.useQuery()
  const { data: payments } = api.subscription.getPayments.useQuery()

  const createMutation = api.subscription.create.useMutation({
    onSuccess: () => {
      refetch()
      alert('Assinatura criada com sucesso!')
    },
    onError: (error) => {
      alert('Erro ao criar assinatura: ' + error.message)
    }
  })

  const cancelMutation = api.subscription.cancel.useMutation({
    onSuccess: () => {
      refetch()
      alert('Assinatura cancelada com sucesso!')
    },
  })

  const handleSubscribe = (planId: string) => {
    createMutation.mutate({
      planId,
      billingCycle,
      paymentMethod,
    })
  }

  if (subLoading || plansLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  const currentPlan = subscription?.plan

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Planos e Assinatura</h1>
        <p className="text-zinc-400 mt-1">
          Gerencie seu plano e informações de pagamento
        </p>
      </div>

      {/* Current Subscription Status */}
      {subscription && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Sua Assinatura</h2>
              <p className="text-zinc-400">
                Plano {subscription.plan?.name} -{' '}
                <span className={`font-medium ${
                  subscription.status === 'ACTIVE' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {subscription.status === 'ACTIVE' ? 'Ativa' :
                   subscription.status === 'PAST_DUE' ? 'Atrasada' : 'Cancelada'}
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">
                R$ {Number(subscription.amount).toFixed(2)}
              </p>
              <p className="text-zinc-400 text-sm">
                por {subscription.billingCycle === 'MONTHLY' ? 'mês' : 'ano'}
              </p>
            </div>
          </div>

          {subscription.nextBillingDate && (
            <div className="mt-4 pt-4 border-t border-zinc-800">
              <p className="text-zinc-400 text-sm">
                Próxima cobrança: {format(new Date(subscription.nextBillingDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          )}

          {subscription.status === 'ACTIVE' && (
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => {
                  if (confirm('Tem certeza que deseja cancelar sua assinatura?')) {
                    cancelMutation.mutate()
                  }
                }}
                className="px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
              >
                Cancelar assinatura
              </button>
            </div>
          )}
        </div>
      )}

      {/* Plans */}
      <h2 className="text-xl font-semibold text-white mb-4">Escolha seu Plano</h2>

      {/* Billing Cycle Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setBillingCycle('MONTHLY')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            billingCycle === 'MONTHLY'
              ? 'bg-orange-500 text-white'
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
          }`}
        >
          Mensal
        </button>
        <button
          onClick={() => setBillingCycle('YEARLY')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            billingCycle === 'YEARLY'
              ? 'bg-orange-500 text-white'
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
          }`}
        >
          Anual (Economize 20%)
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {plans?.map((plan) => {
          const price = billingCycle === 'MONTHLY'
            ? Number(plan.priceMonthly)
            : Number(plan.priceYearly)
          const isCurrentPlan = currentPlan?.id === plan.id

          return (
            <div
              key={plan.id}
              className={`bg-zinc-900 border rounded-xl p-6 transition-all ${
                isCurrentPlan
                  ? 'border-orange-500 ring-2 ring-orange-500/20'
                  : 'border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
              <p className="text-zinc-400 text-sm mt-1">{plan.description}</p>

              <div className="mt-4">
                <span className="text-3xl font-bold text-white">R$ {price.toFixed(2)}</span>
                <span className="text-zinc-400 text-sm">/{billingCycle === 'MONTHLY' ? 'mês' : 'ano'}</span>
              </div>

              <ul className="mt-4 space-y-2">
                <li className="flex items-center gap-2 text-sm text-zinc-300">
                  <Check className="h-4 w-4 text-green-400" />
                  Até {plan.maxUsers} usuário(s)
                </li>
                <li className="flex items-center gap-2 text-sm text-zinc-300">
                  <Check className="h-4 w-4 text-green-400" />
                  {plan.maxContacts} contatos
                </li>
                <li className="flex items-center gap-2 text-sm text-zinc-300">
                  <Check className="h-4 w-4 text-green-400" />
                  {plan.maxDeals} negócios
                </li>
                <li className="flex items-center gap-2 text-sm text-zinc-300">
                  <Check className="h-4 w-4 text-green-400" />
                  {plan.maxConversations} conversas/mês
                </li>
                <li className="flex items-center gap-2 text-sm text-zinc-300">
                  <Check className="h-4 w-4 text-green-400" />
                  {plan.maxStorageGB}GB armazenamento
                </li>
              </ul>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={isCurrentPlan || createMutation.isPending}
                className={`mt-6 w-full py-2 rounded-lg font-medium transition-colors ${
                  isCurrentPlan
                    ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed'
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                }`}
              >
                {isCurrentPlan ? 'Plano Atual' :
                 createMutation.isPending ? 'Processando...' : 'Assinar'}
              </button>
            </div>
          )
        })}
      </div>

      {/* Payment Method Selection */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Forma de Pagamento</h3>
        <div className="flex gap-4">
          <button
            onClick={() => setPaymentMethod('PIX')}
            className={`flex-1 p-4 border rounded-xl flex flex-col items-center gap-2 transition-colors ${
              paymentMethod === 'PIX'
                ? 'border-green-500 bg-green-500/10'
                : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
            }`}
          >
            <QrCode className="h-6 w-6 text-green-400" />
            <span className="text-sm font-medium text-white">PIX</span>
            <span className="text-xs text-zinc-400">Instantâneo</span>
          </button>

          <button
            onClick={() => setPaymentMethod('BOLETO')}
            className={`flex-1 p-4 border rounded-xl flex flex-col items-center gap-2 transition-colors ${
              paymentMethod === 'BOLETO'
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
            }`}
          >
            <Barcode className="h-6 w-6 text-blue-400" />
            <span className="text-sm font-medium text-white">Boleto</span>
            <span className="text-xs text-zinc-400">Até 10 dias</span>
          </button>

          <button
            onClick={() => setPaymentMethod('CREDIT_CARD')}
            className={`flex-1 p-4 border rounded-xl flex flex-col items-center gap-2 transition-colors ${
              paymentMethod === 'CREDIT_CARD'
                ? 'border-purple-500 bg-purple-500/10'
                : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
            }`}
          >
            <CreditCard className="h-6 w-6 text-purple-400" />
            <span className="text-sm font-medium text-white">Cartão</span>
            <span className="text-xs text-zinc-400">Parcelado</span>
          </button>
        </div>
      </div>

      {/* Payment History */}
      {payments && payments.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Histórico de Pagamentos</h3>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left p-4 text-sm font-medium text-zinc-400">Data</th>
                  <th className="text-left p-4 text-sm font-medium text-zinc-400">Valor</th>
                  <th className="text-left p-4 text-sm font-medium text-zinc-400">Método</th>
                  <th className="text-left p-4 text-sm font-medium text-zinc-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b border-zinc-800/50">
                    <td className="p-4 text-white">
                      {format(new Date(payment.dueDate), "dd/MM/yyyy")}
                    </td>
                    <td className="p-4 text-white">
                      R$ {Number(payment.amount).toFixed(2)}
                    </td>
                    <td className="p-4 text-zinc-400">
                      {payment.paymentMethod === 'PIX' ? 'PIX' :
                       payment.paymentMethod === 'BOLETO' ? 'Boleto' : 'Cartão'}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        payment.status === 'CONFIRMED' || payment.status === 'RECEIVED'
                          ? 'bg-green-500/20 text-green-400'
                          : payment.status === 'PENDING'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : payment.status === 'OVERDUE'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-zinc-700 text-zinc-400'
                      }`}>
                        {payment.status === 'CONFIRMED' || payment.status === 'RECEIVED' ? 'Pago' :
                         payment.status === 'PENDING' ? 'Pendente' :
                         payment.status === 'OVERDUE' ? 'Atrasado' :
                         payment.status === 'REJECTED' ? 'Rejeitado' :
                         payment.status === 'REFUNDED' ? 'Estornado' : payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Subscription */}
      {!subscription && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-blue-400 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-white">Assinatura não encontrada</h3>
            <p className="text-zinc-400 text-sm mt-1">
              Você não possui uma assinatura ativa. Escolha um plano acima para continuar usando o DealMind.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
