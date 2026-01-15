import { createClient } from '~/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from './logout-button'
import { createCaller } from '~/server/api/root'
import { createTRPCContext } from '~/server/api/trpc'

const quickActions = [
  { label: 'Novo Lead', href: '/dashboard/contacts/new', icon: 'user-plus' },
  { label: 'Nova Negociação', href: '/dashboard/deals/new', icon: 'folder-plus' },
  { label: 'Ver Pipeline', href: '/dashboard/deals', icon: 'chart' },
  { label: 'Ver Relatórios', href: '/dashboard/reports', icon: 'analytics' },
]

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const user = session.user
  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário'

  // Create tRPC caller
  const ctx = await createTRPCContext({
    supabase,
    headers: new Headers(),
  })
  const caller = createCaller(ctx)

  // Fetch real data
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

  // Calculate metrics
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
      icon: 'currency',
    },
    {
      label: 'Negociações Abertas',
      value: totalDeals.toString(),
      change: `+${totalDeals}`,
      positive: true,
      icon: 'folder',
    },
    {
      label: 'Taxa de Conversão',
      value: `${conversionRate}%`,
      change: `${wonDeals} ganhas`,
      positive: true,
      icon: 'chart',
    },
    {
      label: 'Total de Contatos',
      value: (contactStats?.total || 0).toString(),
      change: `${contactStats?.withEmail || 0} com email`,
      positive: true,
      icon: 'users',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 pt-16">
          {/* Logo no Sidebar */}
          <div className="flex h-16 items-center justify-center border-b border-gray-800">
            <Link href="/" className="text-2xl font-bold text-white">
              DealMind
            </Link>
          </div>

          {/* Navigation */}
          <nav className="mt-6 px-4 space-y-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-lg bg-blue-600 px-4 py-3 text-white font-medium"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Dashboard
            </Link>

            <Link
              href="/dashboard/contacts"
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Contatos
            </Link>

            <Link
              href="/dashboard/deals"
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Negociações
            </Link>

            <Link
              href="/dashboard/companies"
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Empresas
            </Link>

            <Link
              href="/dashboard/users"
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Usuários
            </Link>
          </nav>

          {/* User Info no Sidebar */}
          <div className="absolute bottom-0 left-0 right-0 border-t border-gray-800 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-semibold">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-white">{userName}</p>
                <p className="truncate text-xs text-gray-400">{user.email}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 pl-64">
          {/* Header */}
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-6">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <LogoutButton />
            </div>
          </header>

          {/* Page Content */}
          <main className="p-6">
            {/* Welcome Banner */}
            <div className="mb-6 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
              <h2 className="text-2xl font-bold">Bem-vindo de volta, {userName}!</h2>
              <p className="mt-1 text-blue-100">Aqui está o resumo das suas atividades hoje.</p>
            </div>

            {/* Quick Actions */}
            <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                    <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{action.label}</span>
                </Link>
              ))}
            </div>

            {/* Metrics Cards */}
            <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {metrics.map((metric) => (
                <div key={metric.label} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">{metric.label}</p>
                      <p className="mt-1 text-2xl font-bold text-gray-900">{metric.value}</p>
                    </div>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      metric.positive ? 'bg-green-100' : 'bg-yellow-100'
                    }`}>
                      <svg className={`h-5 w-5 ${metric.positive ? 'text-green-600' : 'text-yellow-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-sm">
                    <span className={metric.positive ? 'text-green-600' : 'text-yellow-600'}>
                      {metric.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Pipeline by Stage */}
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-6 py-4">
                  <h3 className="font-semibold text-gray-900">Pipeline por Estágio</h3>
                </div>
                <div className="p-6">
                  {pipelineStats?.byStage && pipelineStats.byStage.length > 0 ? (
                    <div className="space-y-3">
                      {pipelineStats.byStage.map((stage: any) => (
                        <div key={stage.stage} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`h-2 w-2 rounded-full ${
                              stage.stage === 'CLOSED_WON' ? 'bg-green-500' :
                              stage.stage === 'CLOSED_LOST' ? 'bg-red-500' :
                              stage.stage === 'NEGOTIATION' ? 'bg-purple-500' :
                              stage.stage === 'PROPOSAL' ? 'bg-yellow-500' :
                              stage.stage === 'QUALIFICATION' ? 'bg-blue-500' :
                              'bg-gray-500'
                            }`} />
                            <span className="text-sm text-gray-700">
                              {stage.stage === 'LEAD' ? 'Lead' :
                               stage.stage === 'QUALIFICATION' ? 'Qualificação' :
                               stage.stage === 'PROPOSAL' ? 'Proposta' :
                               stage.stage === 'NEGOTIATION' ? 'Negociação' :
                               stage.stage === 'CLOSED_WON' ? 'Ganho' :
                               stage.stage === 'CLOSED_LOST' ? 'Perdido' : stage.stage}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-medium text-gray-900">{stage.count}</span>
                            <span className="ml-2 text-sm text-gray-500">
                              ({formatCurrency(stage.value)})
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Nenhuma negociação ainda. Comece adicionando deals!
                    </p>
                  )}
                </div>
                <div className="border-t border-gray-100 px-6 py-4">
                  <Link href="/dashboard/deals" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                    Ver pipeline completo →
                  </Link>
                </div>
              </div>

              {/* Recent Deals */}
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-6 py-4">
                  <h3 className="font-semibold text-gray-900">Negociações Recentes</h3>
                </div>
                <div className="divide-y divide-gray-100 px-6 py-4">
                  {recentDeals.length > 0 ? recentDeals.map((deal: any) => (
                    <Link
                      key={deal.id}
                      href={`/dashboard/deals/${deal.id}`}
                      className="flex items-center gap-4 py-3 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors"
                    >
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        deal.stage === 'CLOSED_WON' ? 'bg-green-100 text-green-600' :
                        deal.stage === 'CLOSED_LOST' ? 'bg-red-100 text-red-600' :
                        deal.priority === 'HIGH' || deal.priority === 'URGENT' ? 'bg-orange-100 text-orange-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{deal.title}</p>
                        <p className="text-xs text-gray-500">{deal.contact?.name || 'Sem contato'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{formatCurrency(Number(deal.value))}</p>
                        <p className={`text-xs ${
                          deal.stage === 'CLOSED_WON' ? 'text-green-600' :
                          deal.stage === 'CLOSED_LOST' ? 'text-red-600' :
                          'text-gray-500'
                        }`}>
                          {deal.stage === 'LEAD' ? 'Lead' :
                           deal.stage === 'QUALIFICATION' ? 'Qualificação' :
                           deal.stage === 'PROPOSAL' ? 'Proposta' :
                           deal.stage === 'NEGOTIATION' ? 'Negociação' :
                           deal.stage === 'CLOSED_WON' ? 'Ganho' :
                           deal.stage === 'CLOSED_LOST' ? 'Perdido' : deal.stage}
                        </p>
                      </div>
                    </Link>
                  )) : (
                    <div className="text-center py-8">
                      <p className="text-sm text-gray-500">Nenhuma negociação ainda.</p>
                      <Link
                        href="/dashboard/deals/new"
                        className="mt-2 inline-flex text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        Criar primeira negociação
                      </Link>
                    </div>
                  )}
                </div>
                <div className="border-t border-gray-100 px-6 py-4">
                  <Link href="/dashboard/deals" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                    Ver todas as negociações →
                  </Link>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
