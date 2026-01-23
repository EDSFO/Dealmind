import { createClient } from '~/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createCaller } from '~/server/api/root'
import { createTRPCContext } from '~/server/api/trpc'
import {
  Plus,
  ArrowUpRight,
  Users,
  Target,
  MessageSquare,
  TrendingUp,
  Clock,
  ChevronRight
} from 'lucide-react'
import { cn } from '~/lib/utils'

const quickActions = [
  { label: 'Novo Lead', href: '/dashboard/contacts/new', icon: Users },
  { label: 'Nova Negociação', href: '/dashboard/deals/new', icon: Target },
  { label: 'Nova Conversa', href: '/dashboard/conversations/new', icon: MessageSquare },
  { label: 'Ver Pipeline', href: '/dashboard/deals', icon: TrendingUp },
]

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(date: any): string {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('pt-BR')
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const user = session.user
  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário'

  const ctx = await createTRPCContext({
    headers: new Headers(),
  })
  const caller = createCaller(ctx)

  let deals: any[] = []
  let pipelineStats: any = null
  let contactStats: any = null
  let recentDeals: any[] = []

  try {
    deals = await caller.deal.list()
    pipelineStats = await caller.deal.pipelineStats()
    contactStats = await caller.contact.stats()
    recentDeals = deals.slice(0, 5)
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
  }

  const totalDeals = pipelineStats?.totalDeals || 0
  const totalValue = pipelineStats?.totalValue || 0
  const wonDeals = pipelineStats?.wonThisMonth || 0
  const lostDeals = pipelineStats?.lostThisMonth || 0
  const conversionRate = totalDeals > 0 ? ((wonDeals / (wonDeals + lostDeals)) * 100).toFixed(1) : '0'

  const metrics = [
    {
      label: 'Total de Vendas',
      value: formatCurrency(totalValue),
      change: `+${wonDeals} este mês`,
      positive: true,
      icon: TrendingUp,
    },
    {
      label: 'Negociações Abertas',
      value: totalDeals.toString(),
      change: `+${totalDeals}`,
      positive: true,
      icon: Target,
    },
    {
      label: 'Taxa de Conversão',
      value: `${conversionRate}%`,
      change: `${wonDeals} ganhas`,
      positive: true,
      icon: ArrowUpRight,
    },
    {
      label: 'Total de Contatos',
      value: (contactStats?.total || 0).toString(),
      change: `${contactStats?.withEmail || 0} com email`,
      positive: true,
      icon: Users,
    },
  ]

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#001d3a]">Olá, {userName}!</h1>
          <p className="text-gray-500 mt-1">Aqui está o que está acontecendo com suas vendas hoje.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">
            Personalizar
          </button>
          <Link
            href="/dashboard/deals/new"
            className="px-4 py-2 bg-[#ff5c35] text-white rounded-md text-sm font-semibold hover:bg-[#e04d2b] transition-all shadow-sm flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Novo Negócio
          </Link>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <div key={metric.label} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                <metric.icon className="h-5 w-5 text-blue-600" />
              </div>
              <span className={cn(
                "text-xs font-bold px-2 py-0.5 rounded",
                metric.positive ? "text-green-700 bg-green-50" : "text-yellow-700 bg-yellow-50"
              )}>
                {metric.change}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-500">{metric.label}</p>
            <h3 className="text-2xl font-bold text-[#001d3a] mt-1">{metric.value}</h3>
          </div>
        ))}
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="group flex flex-col items-center p-6 bg-white border border-gray-200 rounded-xl hover:border-orange-200 hover:bg-orange-50/30 transition-all text-center"
          >
            <div className="mb-3 p-3 bg-gray-50 rounded-full group-hover:bg-orange-100/50 group-hover:scale-110 transition-all">
              <action.icon className="h-6 w-6 text-gray-400 group-hover:text-orange-500" />
            </div>
            <span className="text-sm font-semibold text-gray-700 group-hover:text-[#001d3a]">{action.label}</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Deals Table-ish */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-[#001d3a] flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" /> Negociações Recentes
            </h3>
            <Link href="/dashboard/deals" className="text-xs font-semibold text-blue-600 hover:underline">
              Ver tudo
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentDeals.length > 0 ? recentDeals.map((deal: any) => (
              <Link
                key={deal.id}
                href={`/dashboard/deals/${deal.id}`}
                className="flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors group"
              >
                <div className="h-10 w-10 flex-shrink-0 bg-blue-50 rounded-full flex items-center justify-center font-bold text-blue-600 group-hover:bg-blue-100">
                  {deal.title.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#001d3a] truncate">{deal.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 capitalize">{deal.stage?.name?.toLowerCase().replace(/_/g, ' ') || 'Sem estágio'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[#001d3a]">{formatCurrency(deal.value)}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{formatDate(deal.createdAt)}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-600" />
              </Link>
            )) : (
              <div className="p-10 text-center text-gray-500 italic text-sm">
                Nenhuma negociação recente para exibir.
              </div>
            )}
          </div>
        </div>

        {/* Pipeline Summary Chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
          <h3 className="font-bold text-[#001d3a]">Resumo do Pipeline</h3>
          <div className="space-y-4">
            {pipelineStats?.byStage?.map((stage: any) => (
              <div key={stage.stageId} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">{stage.stageName}</span>
                  <span className="font-bold text-[#001d3a]">{formatCurrency(stage.value)}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${totalValue > 0 ? Math.max(5, (stage.value / totalValue) * 100) : 0}%` }}
                  />
                </div>
              </div>
            ))}
            {(!pipelineStats?.byStage || pipelineStats.byStage.length === 0) && (
              <div className="h-48 flex flex-col items-center justify-center text-center space-y-3">
                <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <Target className="h-6 w-6 text-gray-300" />
                </div>
                <p className="text-sm text-gray-500">Adicione negócios para ver a distribution do seu pipeline.</p>
              </div>
            )}
          </div>
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
            <span className="text-gray-500 italic">Total de {deals.length} negócios</span>
            <span className="font-bold text-green-600">Taxa: {conversionRate}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
