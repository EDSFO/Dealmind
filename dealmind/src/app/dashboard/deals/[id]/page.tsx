import { createClient } from '~/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createCaller } from '~/server/api/root'
import { createTRPCContext } from '~/server/api/trpc'
import { updateDealStage } from './actions'
import DealDetailClient from './deal-detail-client'
import {
  ChevronLeft,
  MoreHorizontal,
  Target,
} from 'lucide-react'
import { cn } from '~/lib/utils'

const DEAL_STAGES = [
  { key: 'lead', label: 'Prospecção' },
  { key: 'qualification', label: 'Qualificação' },
  { key: 'proposal', label: 'Proposta' },
  { key: 'negotiation', label: 'Negociação' },
  { key: 'contracting', label: 'Contratação' },
  { key: 'closed_won', label: 'Fechado Ganho' },
  { key: 'closed_lost', label: 'Fechado Perdido' },
]

export default async function DealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const ctx = await createTRPCContext({
    headers: new Headers(),
  })
  const caller = createCaller(ctx)

  let deal: any = null
  let activities: any[] = []
  try {
    deal = await caller.deal.byId({ id })
    if (deal?.activities) {
      activities = deal.activities
    }
  } catch (error) {
    console.error('Error fetching data:', error)
  }

  if (!deal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <h1 className="text-2xl font-bold text-[#001d3a]">Negócio não encontrado</h1>
        <Link href="/dashboard/deals" className="mt-4 text-[#0091ae] hover:underline flex items-center gap-1 font-semibold">
          <ChevronLeft className="h-4 w-4" /> Voltar para o pipeline
        </Link>
      </div>
    )
  }

  const currentStageKey = deal.stage?.key || ''
  const currentStageIndex = DEAL_STAGES.findIndex(s => s.key === currentStageKey)

  return (
    <div className="bg-[#f5f8fa] min-h-screen flex flex-col">
      {/* Page Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/deals" className="p-2 hover:bg-gray-100 rounded-md transition-colors">
              <ChevronLeft className="h-5 w-5 text-gray-500" />
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Negócio</span>
              </div>
              <h1 className="text-xl font-bold text-[#001d3a]">{deal.title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 border rounded-md text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
              Ações
            </button>
            <button className="px-4 py-2 bg-[#ff5c35] text-white rounded-md text-sm font-bold shadow-sm hover:bg-[#e04d2b] transition-colors">
              Criar tarefa
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-md text-gray-400">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Pipeline Status Indicator */}
      <div className="bg-white border-b px-6 py-2 shadow-sm sticky top-16 z-20">
        <div className="max-w-[1600px] mx-auto overflow-x-auto">
          <div className="flex items-center min-w-max gap-1">
            {DEAL_STAGES.map((stage, idx) => (
              <form key={stage.key} action={updateDealStage} className="relative group">
                <input type="hidden" name="dealId" value={deal.id} />
                <input type="hidden" name="stage" value={stage.key} />
                <button
                  type="submit"
                  disabled={currentStageKey === stage.key}
                  className={cn(
                    "relative px-6 py-2 text-xs font-bold uppercase tracking-tight transition-all flex flex-col items-center gap-1 min-w-[140px]",
                    currentStageKey === stage.key
                      ? "text-[#001d3a]"
                      : idx < currentStageIndex
                        ? "text-blue-600 hover:text-blue-700"
                        : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  <span className="relative z-10">{stage.label}</span>
                  <div className={cn(
                    "h-1.5 w-full rounded-full transition-all mt-1",
                    currentStageKey === stage.key
                      ? "bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]"
                      : idx < currentStageIndex
                        ? "bg-blue-400"
                        : "bg-gray-200"
                  )} />
                </button>
              </form>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <DealDetailClient
          deal={deal}
          activities={activities}
          currentUserId={session.user.id}
          currentUserName={session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Usuário'}
        />
      </div>
    </div>
  )
}
