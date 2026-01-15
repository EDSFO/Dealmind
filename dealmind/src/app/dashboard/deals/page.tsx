import { createClient } from '~/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createCaller } from '~/server/api/root'
import { createTRPCContext } from '~/server/api/trpc'
import KanbanBoard from './kanban-board'

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export default async function DealsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Create tRPC caller with context
  const ctx = await createTRPCContext({
    supabase,
    headers: new Headers(),
  })
  const caller = createCaller(ctx)

  // Fetch deals and users using tRPC
  let deals: any[] = []
  let pipelineStats: any = null
  let users: any[] = []

  try {
    deals = await caller.deal.list()
    pipelineStats = await caller.deal.pipelineStats()
    // Fetch users for the filter dropdown
    const allUsers = await caller.user.list()
    users = allUsers.map((u: any) => ({ id: u.id, name: u.name }))
  } catch (error) {
    console.error('Error fetching deals:', error)
  }

  // Calculate totals
  const totalValue = deals.reduce((sum: number, deal: any) => sum + Number(deal.value), 0)
  const wonDeals = deals.filter((d: any) => d.stage === 'CLOSED_WON').length
  const lostDeals = deals.filter((d: any) => d.stage === 'CLOSED_LOST').length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar - Same as dashboard */}
        <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 pt-16">
          <div className="flex h-16 items-center justify-center border-b border-gray-800">
            <Link href="/" className="text-2xl font-bold text-white">DealMind</Link>
          </div>
          <nav className="mt-6 px-4 space-y-1">
            <Link href="/dashboard" className="flex items-center gap-3 rounded-lg px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
              </svg>
              Dashboard
            </Link>
            <Link href="/dashboard/contacts" className="flex items-center gap-3 rounded-lg px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Contatos
            </Link>
            <Link href="/dashboard/deals" className="flex items-center gap-3 rounded-lg bg-blue-600 px-4 py-3 text-white font-medium">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Negociações
            </Link>
            <Link href="/dashboard/companies" className="flex items-center gap-3 rounded-lg px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Empresas
            </Link>
            <Link href="/dashboard/users" className="flex items-center gap-3 rounded-lg px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Usuários
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 pl-64">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-6">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-gray-900">Pipeline de Vendas</h1>
              <span className="text-sm text-gray-500">(Arraste os cards para mudar de estágio)</span>
            </div>
            <Link
              href="/dashboard/deals/new"
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nova Negociação
            </Link>
          </header>

          <main className="p-6">
            {/* Stats */}
            <div className="mb-6 grid gap-4 md:grid-cols-4">
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <p className="text-sm text-gray-500">Total de Deals</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{deals.length}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <p className="text-sm text-gray-500">Valor Total</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{formatCurrency(totalValue)}</p>
              </div>
              <div className="rounded-xl border border-green-200 bg-green-50 p-4 shadow-sm">
                <p className="text-sm text-green-700">Ganhos</p>
                <p className="mt-1 text-2xl font-bold text-green-700">{wonDeals}</p>
              </div>
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
                <p className="text-sm text-red-700">Perdidos</p>
                <p className="mt-1 text-2xl font-bold text-red-700">{lostDeals}</p>
              </div>
            </div>

            {/* Kanban Board with Drag & Drop */}
            {deals.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Nenhuma negociação ainda</h3>
                <p className="mt-1 text-sm text-gray-500">Comece a adicionar negociações para ver seu pipeline.</p>
                <Link
                  href="/dashboard/deals/new"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Criar primeira negociação
                </Link>
              </div>
            ) : (
              <KanbanBoard initialDeals={deals} users={users} />
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
