import { createClient } from '~/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createCaller } from '~/server/api/root'
import { createTRPCContext } from '~/server/api/trpc'
import { updateDealStage } from './actions'
import EditableField from './edit-form'
import ActivityList from './activity-list'
import MessageList from './message-list'
import {
  ChevronLeft,
  MoreHorizontal,
  Target,
  User,
  Building2,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Info,
  Sparkles,
  BarChart3,
  CheckCircle2,
  Clock,
  History
} from 'lucide-react'
import { cn } from '~/lib/utils'

const DEAL_STAGES = [
  { key: 'LEAD', label: 'Prospecção' },
  { key: 'QUALIFICATION', label: 'Qualificação' },
  { key: 'PROPOSAL', label: 'Proposta' },
  { key: 'NEGOTIATION', label: 'Negociação' },
  { key: 'CONTRACTING', label: 'Contratação' },
  { key: 'CLOSED_WON', label: 'Fechado Ganho' },
  { key: 'CLOSED_LOST', label: 'Fechado Perdido' },
]

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function formatDate(date: Date | string | null): string {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

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
    activities = await caller.activity.list({ dealId: id })
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

  const currentStageIndex = DEAL_STAGES.findIndex(s => s.key === deal.stage)

  return (
    <div className="bg-[#f5f8fa] min-h-screen">
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
                  disabled={deal.stage === stage.key}
                  className={cn(
                    "relative px-6 py-2 text-xs font-bold uppercase tracking-tight transition-all flex flex-col items-center gap-1 min-w-[140px]",
                    deal.stage === stage.key
                      ? "text-[#001d3a]"
                      : idx < currentStageIndex
                        ? "text-blue-600 hover:text-blue-700"
                        : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  <span className="relative z-10">{stage.label}</span>
                  <div className={cn(
                    "h-1.5 w-full rounded-full transition-all mt-1",
                    deal.stage === stage.key
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

      {/* Main Content Grid */}
      <div className="max-w-[1600px] mx-auto p-6 grid grid-cols-1 xl:grid-cols-4 gap-6">

        {/* Left Column: Properties & Info */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#001d3a] flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-500" /> Sobre este negócio
              </h2>
            </div>
            <div className="p-4 space-y-2">
              <EditableField
                label="Título do negócio"
                value={deal.title}
                dealId={deal.id}
                field="title"
              />
              <EditableField
                label="Valor"
                value={deal.value}
                dealId={deal.id}
                field="value"
                type="number"
                format={(v) => formatCurrency(Number(v))}
              />
              <EditableField
                label="Probabilidade"
                value={deal.probability}
                dealId={deal.id}
                field="probability"
                type="number"
                format={(v) => `${v}%`}
              />
              <EditableField
                label="Prioridade"
                value={deal.priority}
                dealId={deal.id}
                field="priority"
                type="select"
                options={[
                  { value: 'LOW', label: 'Baixa' },
                  { value: 'MEDIUM', label: 'Média' },
                  { value: 'HIGH', label: 'Alta' },
                  { value: 'URGENT', label: 'Urgente' },
                ]}
              />
              <div className="pt-2">
                <p className="text-[11px] font-bold text-gray-500 uppercase mb-1">Data de fechamento</p>
                <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  {formatDate(deal.expectedClose)}
                </p>
              </div>
              <div className="pt-2 border-t mt-4">
                <EditableField
                  label="Descrição"
                  value={deal.description}
                  dealId={deal.id}
                  field="description"
                  type="textarea"
                  multiline
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#001d3a] flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-orange-500" /> Performance
              </h2>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">Idade</span>
                <span className="text-xs font-bold text-[#001d3a]">12 dias</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">Atividades</span>
                <span className="text-xs font-bold text-[#001d3a]">{activities.length} total</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 w-[60%]" />
              </div>
              <p className="text-[10px] text-gray-400 italic">Previsão saudável com base no histórico similar.</p>
            </div>
          </div>
        </div>

        {/* Center Column: Activities & AI Insights */}
        <div className="xl:col-span-2 space-y-6">
          {/* AI Insights Card */}
          <div className="bg-gradient-to-br from-[#001d3a] to-[#003d73] rounded-xl border border-blue-900 shadow-xl p-6 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <Sparkles className="h-32 w-32" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-orange-500 rounded-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-lg font-bold">Análise do Assistente IA</h2>
              </div>
              <div className="space-y-4">
                <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm border border-white/10">
                  <h3 className="text-sm font-bold text-orange-400 mb-2 uppercase tracking-wide">Resumo Executivo</h3>
                  <p className="text-sm leading-relaxed text-slate-200">
                    O cliente demonstrou alto interesse na solução de automação. O principal ponto de dor é o tempo de resposta manual atual.
                    Recomendado focar na demonstração de ROI durante a próxima chamada de proposta.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Sentimento</p>
                    <p className="text-sm font-bold text-green-400 flex items-center gap-1.5 mt-1">
                      <CheckCircle2 className="h-4 w-4" /> Muito Positivo
                    </p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Temperatura</p>
                    <p className="text-sm font-bold text-orange-400 flex items-center gap-1.5 mt-1">
                      <Clock className="h-4 w-4" /> Quente
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Tabs & Content */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b">
              <button className="px-4 py-3 text-sm font-bold text-blue-600 border-b-2 border-blue-600 flex items-center gap-2">
                <History className="h-4 w-4" /> Atividades
              </button>
              <button className="px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 flex items-center gap-2">
                <Mail className="h-4 w-4" /> Emails
              </button>
              <button className="px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 flex items-center gap-2">
                <Clock className="h-4 w-4" /> Notas
              </button>
            </div>

            <MessageList
              dealId={deal.id}
              conversations={deal.conversations || []}
              currentUserId={session.user.id}
              currentUserName={session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Usuário'}
            />

            <ActivityList
              dealId={deal.id}
              activities={activities}
              currentUserId={session.user.id}
            />
          </div>
        </div>

        {/* Right Column: Associations */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="text-sm font-bold text-[#001d3a] flex items-center gap-2">
                <User className="h-4 w-4 text-blue-500" /> Contato Relacionado
              </h2>
            </div>
            <div className="p-4">
              {deal.contact ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-blue-600 text-lg">
                      {deal.contact.name?.charAt(0) || 'C'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#0091ae] hover:underline cursor-pointer">{deal.contact.name}</p>
                      <p className="text-xs text-gray-500">{deal.contact.position || 'Sem cargo'}</p>
                    </div>
                  </div>
                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <Mail className="h-3.5 w-3.5 text-gray-400" />
                      {deal.contact.email || 'N/A'}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <Phone className="h-3.5 w-3.5 text-gray-400" />
                      {deal.contact.phone || 'N/A'}
                    </div>
                  </div>
                </div>
              ) : (
                <button className="w-full py-4 border-2 border-dashed border-gray-200 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors">
                  + Adicionar contato
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="text-sm font-bold text-[#001d3a] flex items-center gap-2">
                <Building2 className="h-4 w-4 text-purple-500" /> Empresa
              </h2>
            </div>
            <div className="p-4">
              {deal.contact?.company ? (
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center font-bold text-purple-600">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#001d3a]">{deal.contact.company}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-tighter">B2B • São Paulo</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">Nenhuma empresa vinculada.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="text-sm font-bold text-[#001d3a] flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" /> Responsável
              </h2>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 text-xs">
                  {deal.owner?.name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#001d3a]">{deal.owner?.name || 'Não definido'}</p>
                  <p className="text-[10px] text-gray-500">{deal.owner?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
