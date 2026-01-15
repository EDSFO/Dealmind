import { createClient } from '~/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createCaller } from '~/server/api/root'
import { createTRPCContext } from '~/server/api/trpc'
import { updateDealStage } from './actions'
import EditableField from './edit-form'
import ActivityList from './activity-list'
import MessageList from './message-list'

const DEAL_STAGES = [
  { key: 'LEAD', label: 'Lead', color: 'bg-gray-100 border-gray-300 text-gray-700' },
  { key: 'QUALIFICATION', label: 'Qualificação', color: 'bg-blue-100 border-blue-300 text-blue-700' },
  { key: 'PROPOSAL', label: 'Proposta', color: 'bg-yellow-100 border-yellow-300 text-yellow-700' },
  { key: 'NEGOTIATION', label: 'Negociação', color: 'bg-purple-100 border-purple-300 text-purple-700' },
  { key: 'CLOSED_WON', label: 'Ganho', color: 'bg-green-100 border-green-300 text-green-700' },
  { key: 'CLOSED_LOST', label: 'Perdido', color: 'bg-red-100 border-red-300 text-red-700' },
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
    supabase,
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Deal não encontrado</h1>
          <p className="mt-2 text-gray-500">O deal que você está procurando não existe.</p>
          <Link href="/dashboard/deals" className="mt-4 inline-block text-blue-600 hover:underline">
            Voltar para o pipeline
          </Link>
        </div>
      </div>
    )
  }

  const currentStageIndex = DEAL_STAGES.findIndex(s => s.key === deal.stage)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
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
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 pl-64">
          <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-white px-6">
            <Link href="/dashboard/deals" className="mr-4 text-gray-400 hover:text-gray-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-xl font-semibold text-gray-900 truncate">{deal.title}</h1>
            <span className={`ml-4 rounded-full px-3 py-1 text-sm font-medium ${
              deal.stage === 'CLOSED_WON' ? 'bg-green-100 text-green-700' :
              deal.stage === 'CLOSED_LOST' ? 'bg-red-100 text-red-700' :
              deal.priority === 'HIGH' || deal.priority === 'URGENT' ? 'bg-orange-100 text-orange-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {DEAL_STAGES.find(s => s.key === deal.stage)?.label}
            </span>
          </header>

          <main className="p-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Main Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Deal Info Card - Editable */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-500">Título</label>
                      <EditableField
                        label=""
                        value={deal.title}
                        dealId={deal.id}
                        field="title"
                      />
                    </div>
                    <div className="text-right ml-4">
                      <label className="text-sm font-medium text-gray-500">Probabilidade</label>
                      <p className="mt-1 text-2xl font-bold text-gray-900">{deal.probability}%</p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 mb-6">
                    <EditableField
                      label="Valor (R$)"
                      value={deal.value}
                      dealId={deal.id}
                      field="value"
                      type="number"
                      format={(v) => formatCurrency(Number(v))}
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
                  </div>

                  <div className="pt-6 border-t">
                    <EditableField
                      label="Descrição"
                      value={deal.description}
                      dealId={deal.id}
                      field="description"
                      type="textarea"
                      multiline
                    />
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2 pt-6 border-t">
                    <div>
                      <p className="text-sm text-gray-500">Previsão de Fechamento</p>
                      <p className="mt-1 font-medium text-gray-900">{formatDate(deal.expectedClose)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Criado em</p>
                      <p className="mt-1 font-medium text-gray-900">{formatDate(deal.createdAt)}</p>
                    </div>
                    {deal.wonAt && (
                      <div>
                        <p className="text-sm text-gray-500">Ganho em</p>
                        <p className="mt-1 font-medium text-green-600">{formatDate(deal.wonAt)}</p>
                      </div>
                    )}
                    {deal.lostReason && (
                      <div>
                        <p className="text-sm text-gray-500">Motivo da Perda</p>
                        <p className="mt-1 font-medium text-red-600">{deal.lostReason}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Conversations */}
                <MessageList
                  dealId={deal.id}
                  conversations={deal.conversations || []}
                  currentUserId={session.user.id}
                  currentUserName={session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Usuário'}
                />

                {/* Activity Timeline */}
                <ActivityList
                  dealId={deal.id}
                  activities={activities}
                  currentUserId={session.user.id}
                />
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Stage Pipeline */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4">Estágio do Deal</h3>
                  <div className="space-y-2">
                    {DEAL_STAGES.map((stage, index) => (
                      <form key={stage.key} action={updateDealStage}>
                        <input type="hidden" name="dealId" value={deal.id} />
                        <input type="hidden" name="stage" value={stage.key} />
                        <button
                          type="submit"
                          disabled={deal.stage === stage.key}
                          className={`w-full rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                            deal.stage === stage.key
                              ? `${stage.color} border-2 cursor-default`
                              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {stage.label}
                          {deal.stage === stage.key && (
                            <svg className="inline-block ml-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      </form>
                    ))}
                  </div>
                </div>

                {/* Contact */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4">Contato</h3>
                  {deal.contact ? (
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium">
                          {deal.contact.name?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{deal.contact.name}</p>
                          {deal.contact.company && (
                            <p className="text-sm text-gray-500">{deal.contact.company}</p>
                          )}
                        </div>
                      </div>
                      {deal.contact.email && (
                        <a href={`mailto:${deal.contact.email}`} className="text-sm text-blue-600 hover:underline">
                          {deal.contact.email}
                        </a>
                      )}
                      {deal.contact.phone && (
                        <a href={`tel:${deal.contact.phone}`} className="text-sm text-blue-600 hover:underline block mt-1">
                          {deal.contact.phone}
                        </a>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Sem contato vinculado.</p>
                  )}
                </div>

                {/* Owner */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4">Responsável</h3>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-medium">
                      {deal.owner?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{deal.owner?.name || 'Não definido'}</p>
                      <p className="text-sm text-gray-500">{deal.owner?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Priority */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4">Prioridade</h3>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    deal.priority === 'URGENT' ? 'bg-red-100 text-red-700' :
                    deal.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                    deal.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {deal.priority === 'LOW' ? 'Baixa' :
                     deal.priority === 'MEDIUM' ? 'Média' :
                     deal.priority === 'HIGH' ? 'Alta' :
                     deal.priority === 'URGENT' ? 'Urgente' : deal.priority}
                  </span>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
