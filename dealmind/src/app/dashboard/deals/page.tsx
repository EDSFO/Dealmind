import { createClient } from '~/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createCaller } from '~/server/api/root'
import { createTRPCContext } from '~/server/api/trpc'
import KanbanBoard from './kanban-board'
import { ChevronDown, Plus, Filter, Grid, List as ListIcon, Target } from 'lucide-react'

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value)
}

export default async function DealsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const ctx = await createTRPCContext({
    headers: new Headers(),
  })
  const caller = createCaller(ctx)

  let deals: any[] = []
  let users: any[] = []

  try {
    deals = await caller.deal.list()
    const allUsers = await caller.user.list()
    users = allUsers.map((u: any) => ({ id: u.id, name: u.name }))
  } catch (error) {
    console.error('Error fetching deals:', error)
  }

  const totalValue = deals.reduce((sum: number, deal: any) => sum + Number(deal.value), 0)
  const openDealsValue = deals.filter((d: any) => d.stage !== 'CLOSED_WON' && d.stage !== 'CLOSED_LOST').reduce((sum: number, d: any) => sum + Number(d.value), 0)

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] overflow-hidden">
      {/* Top Title Bar */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-[#001d3a] flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 -ml-2 rounded transition-colors group">
            Negócios
            <ChevronDown className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            Ações <ChevronDown className="h-4 w-4" />
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            Importar
          </button>
          <Link
            href="/dashboard/deals/new"
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#ff5c35] rounded-md hover:bg-[#e04d2b] transition-colors shadow-sm"
          >
            Criar negócio
          </Link>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="bg-white border-b px-6 flex items-center justify-between h-12 min-h-[48px]">
        <div className="flex items-center gap-6 h-full">
          <button className="text-sm font-semibold text-[#001d3a] border-b-2 border-orange-500 h-full flex items-center">
            Todos os negócios
          </button>
          <button className="text-sm font-medium text-gray-500 hover:text-gray-700 h-full flex items-center">
            Meus negócios
          </button>
          <button className="text-sm font-medium text-blue-600 hover:text-blue-700 h-full flex items-center gap-1">
            <Plus className="h-4 w-4" /> Adicionar visualização (2/50)
          </button>
          <button className="text-sm font-medium text-gray-500 hover:text-gray-700 h-full flex items-center whitespace-nowrap">
            Todas as exibições
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border-b px-6 py-3 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-md border border-gray-200">
            <button className="p-1.5 rounded bg-white shadow-sm transition-all"><Grid className="h-4 w-4 text-[#001d3a]" /></button>
            <button className="p-1.5 rounded hover:bg-gray-200 transition-all"><ListIcon className="h-4 w-4 text-gray-500" /></button>
          </div>

          <div className="flex items-center gap-2 ml-2 flex-wrap">
            <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              Pipeline de Vendas <ChevronDown className="h-3 w-3" />
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-md">
              Proprietário do negócio (1) <ChevronDown className="h-3 w-3" />
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              Data de criação <ChevronDown className="h-3 w-3" />
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              Data da última atividade <ChevronDown className="h-3 w-3" />
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              Data de fechamento <ChevronDown className="h-3 w-3" />
            </button>
            <button className="text-xs font-medium text-gray-500 hover:text-gray-700 ml-1">
              + Mais
            </button>
            <button className="text-xs font-medium text-red-500 hover:text-red-700 ml-1">
              Apagar tudo
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 ml-auto">
          <button className="flex items-center gap-2 text-xs font-medium text-blue-600 hover:text-blue-700">
            <Filter className="h-4 w-4" /> Filtros avançados
          </button>
        </div>
      </div>

      {/* Metrics Summary Bar */}
      <div className="bg-white border-b px-6 py-6 overflow-x-auto">
        <div className="flex items-center justify-between min-w-max gap-8 px-4">
          <div className="text-center flex-1">
            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1">VALOR TOTAL DE NEGÓCIO</p>
            <h3 className="text-2xl font-bold text-[#001d3a]">{formatCurrency(totalValue)}</h3>
            <p className="text-xs text-gray-500 mt-0.5">Média por negócio: {formatCurrency(totalValue / (deals.length || 1))}</p>
          </div>
          <div className="w-px h-12 bg-gray-200" />
          <div className="text-center flex-1">
            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1">VALOR PONDERADO DE NEGÓCIO</p>
            <h3 className="text-2xl font-bold text-[#001d3a]">{formatCurrency(totalValue * 0.7)}</h3>
            <p className="text-xs text-gray-500 mt-0.5">Média por negócio: {formatCurrency((totalValue * 0.7) / (deals.length || 1))}</p>
          </div>
          <div className="w-px h-12 bg-gray-200" />
          <div className="text-center flex-1">
            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1">VALOR DE NEGÓCIO ABERTO</p>
            <h3 className="text-2xl font-bold text-[#001d3a]">{formatCurrency(openDealsValue)}</h3>
            <p className="text-xs text-gray-500 mt-0.5">Média por negócio: {formatCurrency(openDealsValue / (deals.length || 1))}</p>
          </div>
          <div className="w-px h-12 bg-gray-200" />
          <div className="text-center flex-1">
            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1">VALOR DE NEGÓCIO FECHADO</p>
            <h3 className="text-2xl font-bold text-[#001d3a]">R$ 0</h3>
          </div>
          <div className="w-px h-12 bg-gray-200" />
          <div className="text-center flex-1">
            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1">IDADE MÉDIA DE NEGÓCIO</p>
            <h3 className="text-2xl font-bold text-[#001d3a]">91,8 dias</h3>
          </div>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="flex-1 bg-[#f5f8fa] p-6 overflow-auto">
        {deals.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-12 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm">
              <Target className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-[#001d3a]">Nenhum negócio encontrado</h3>
            <p className="mt-2 text-gray-500 max-w-sm">Use os filtros acima ou crie um novo negócio para começar.</p>
            <Link
              href="/dashboard/deals/new"
              className="mt-6 px-6 py-3 rounded-md bg-[#ff5c35] text-white font-semibold hover:bg-[#e04d2b] transition-all"
            >
              Criar primeiro negócio
            </Link>
          </div>
        ) : (
          <KanbanBoard initialDeals={deals} users={users} />
        )}
      </div>
    </div>
  )
}
