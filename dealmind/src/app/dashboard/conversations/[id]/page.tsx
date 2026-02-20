import { createClient } from '~/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createCaller } from '~/server/api/root'
import { createTRPCContext } from '~/server/api/trpc'
import {
  ChevronLeft,
  MessageSquare,
  User,
  Target,
  FileText,
  Zap,
  Phone,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from 'lucide-react'
import RetryButton from './retry-button'
import CreateActionsButton from './create-actions-button'
function formatDate(date: Date | string | null): string {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'PENDING':
      return (
        <span className="inline-flex items-center rounded-md bg-yellow-50 px-2.5 py-1 text-[10px] font-bold text-yellow-700 uppercase tracking-tight border border-yellow-200">
          Pendente
        </span>
      )
    case 'PROCESSING':
      return (
        <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700 uppercase tracking-tight border border-blue-200">
          Processando
        </span>
      )
    case 'COMPLETED':
      return (
        <span className="inline-flex items-center rounded-md bg-green-50 px-2.5 py-1 text-[10px] font-bold text-green-700 uppercase tracking-tight border border-green-200">
          Concluído
        </span>
      )
    case 'FAILED':
      return (
        <span className="inline-flex items-center rounded-md bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-700 uppercase tracking-tight border border-red-200">
          Falhou
        </span>
      )
    default:
      return (
        <span className="inline-flex items-center rounded-md bg-gray-50 px-2.5 py-1 text-[10px] font-bold text-gray-700 uppercase tracking-tight border border-gray-200">
          {status}
        </span>
      )
  }
}

function getSourceIcon(source: string) {
  switch (source) {
    case 'FIREFLIES':
      return <Zap className="h-4 w-4 text-orange-500" />
    case 'WHATSAPP':
      return <Phone className="h-4 w-4 text-green-500" />
    case 'MANUAL':
      return <FileText className="h-4 w-4 text-gray-400" />
    default:
      return <MessageSquare className="h-4 w-4 text-blue-400" />
  }
}

export default async function ConversationDetailPage({
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

  let conversation: any = null
  try {
    conversation = await caller.conversation.byId({ id })
  } catch (error) {
    console.error('Error fetching conversation:', error)
  }

  if (!conversation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <h1 className="text-2xl font-bold text-[#001d3a]">Conversa não encontrada</h1>
        <Link
          href="/dashboard/conversations"
          className="mt-4 text-[#0091ae] hover:underline flex items-center gap-1 font-semibold"
        >
          <ChevronLeft className="h-4 w-4" /> Voltar para conversas
        </Link>
      </div>
    )
  }

  let insight = conversation?.insight || null

  // Fix: the old (broken) parser stored the full AI JSON inside `summary` 
  // while leaving interests/objections/etc as empty arrays.
  // We need to detect this and re-extract the fields.
  if (insight) {
    const hasNoData =
      (!insight.interests || (insight.interests as any[]).length === 0) &&
      (!insight.objections || (insight.objections as any[]).length === 0) &&
      (!insight.nextActions || (insight.nextActions as any[]).length === 0)

    if (hasNoData && insight.summary) {
      // summary might be a string (JSON text) or an object (Prisma Json field already parsed)
      let parsedFromSummary: any = null

      if (typeof insight.summary === 'object' && insight.summary !== null) {
        // Prisma already parsed the JSON object
        const summaryObj = insight.summary as any
        // Case 1: summary is itself the full analysis object
        if (summaryObj.interests || summaryObj.objections || summaryObj.nextActions) {
          parsedFromSummary = summaryObj
        }
        // Case 2: summary.summary is the real summary string (nested)
        else if (summaryObj.summary && typeof summaryObj.summary === 'string') {
          parsedFromSummary = summaryObj
        }
      } else if (typeof insight.summary === 'string') {
        // summary is a JSON string — try to parse it
        try {
          const jsonMatch = (insight.summary as string).match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            parsedFromSummary = JSON.parse(jsonMatch[0])
          }
        } catch (_) {
          // not valid JSON, keep as is
        }
      }

      if (parsedFromSummary) {
        insight = {
          ...insight,
          summary: typeof parsedFromSummary.summary === 'string'
            ? parsedFromSummary.summary
            : String(insight.summary).substring(0, 300),
          interests: Array.isArray(parsedFromSummary.interests) ? parsedFromSummary.interests : insight.interests,
          objections: Array.isArray(parsedFromSummary.objections) ? parsedFromSummary.objections : insight.objections,
          commitments: Array.isArray(parsedFromSummary.commitments) ? parsedFromSummary.commitments : insight.commitments,
          nextActions: Array.isArray(parsedFromSummary.nextActions) ? parsedFromSummary.nextActions : insight.nextActions,
          progressSignals: Array.isArray(parsedFromSummary.progressSignals) ? parsedFromSummary.progressSignals : insight.progressSignals,
          riskSignals: Array.isArray(parsedFromSummary.riskSignals) ? parsedFromSummary.riskSignals : insight.riskSignals,
        }
      }
    }
  }

  return (
    <div className="bg-[#f5f8fa] min-h-screen">
      {/* Page Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/conversations"
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-3">
              {getSourceIcon(conversation.source)}
              <div>
                <h1 className="text-2xl font-bold text-[#001d3a]">
                  {conversation.subject || 'Conversa sem assunto'}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-500">
                    {formatDate(conversation.conversationDate)}
                  </span>
                  <span className="text-sm text-gray-300">•</span>
                  <span className="text-sm text-gray-500 uppercase">{conversation.source}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(conversation.processingStatus || 'PENDING')}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Column (Left, 2/3) */}
        <div className="xl:col-span-2 space-y-8">

          {/* AI Insights Main Block */}
          {insight ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">

              {/* Predição de sucesso */}
              <div className="mb-6">
                <div className="flex items-center gap-2 text-blue-600 font-semibold mb-3">
                  <Sparkles className="w-5 h-5" />
                  Predição de sucesso
                  <AlertCircle className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex gap-1.5 mb-4">
                  {/* Fake 4/5 dots, or we could calculate from progress signals? */}
                  {[1, 2, 3, 4, 5].map((dot) => (
                    <div
                      key={dot}
                      className={`w-4 h-4 rounded-full ${dot <= 4 ? 'bg-blue-600' : 'bg-gray-200'}`}
                    />
                  ))}
                </div>
                {insight.summary && (
                  <p className="text-sm text-gray-700 leading-relaxed text-justify">
                    {insight.summary}
                  </p>
                )}
              </div>

              {/* Assuntos-chave */}
              {insight.interests && Array.isArray(insight.interests) && insight.interests.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-gray-500" />
                    Assuntos-chave
                  </h3>
                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 text-sm xl:text-base text-gray-700">
                    <ul className="list-disc pl-5 space-y-2">
                      {insight.interests.map((interest: string, index: number) => (
                        <li key={index}>{interest}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Specific information */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-gray-500" />
                  Specific information
                </h3>

                <div className="space-y-4">
                  {/* Dores dos clientes */}
                  {insight.riskSignals && Array.isArray(insight.riskSignals) && insight.riskSignals.length > 0 && (
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <h4 className="font-semibold text-gray-700 text-sm">Dores dos clientes / Sinais de Risco</h4>
                      </div>
                      <div className="p-4 bg-white">
                        <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
                          {insight.riskSignals.map((signal: any, index: number) => (
                            <li key={index}>
                              <span className="font-medium">{signal.signal}</span>
                              <span className="text-gray-400 ml-2 text-xs">(Risco: {signal.severity})</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Objeções */}
                  {insight.objections && Array.isArray(insight.objections) && insight.objections.length > 0 && (
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <h4 className="font-semibold text-gray-700 text-sm">Objeções</h4>
                      </div>
                      <div className="p-4 bg-white">
                        <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
                          {insight.objections.map((objection: string, index: number) => (
                            <li key={index}>{objection}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Sinais de Progresso */}
                  {insight.progressSignals && Array.isArray(insight.progressSignals) && insight.progressSignals.length > 0 && (
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <h4 className="font-semibold text-gray-700 text-sm">Sinais de Progresso</h4>
                      </div>
                      <div className="p-4 bg-white">
                        <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
                          {insight.progressSignals.map((signal: any, index: number) => (
                            <li key={index}>{signal.signal}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center text-gray-500">
              Nenhum insight de IA foi gerado para esta conversa ainda.
            </div>
          )}

          {/* Transcrição em formato unificado abaixo */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
            <h2 className="text-lg font-bold text-[#001d3a] flex items-center gap-2 mb-4">
              <MessageSquare className="h-5 w-5 text-gray-400" />
              Transcrição Original
            </h2>
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-gray-600 font-sans bg-gray-50/50 p-6 rounded-xl border border-gray-100">
                {conversation.transcriptionText || 'Nenhuma transcrição disponível.'}
              </pre>
            </div>
          </div>

        </div>

        {/* Sidebar Column (Right, 1/3) */}
        <div className="xl:col-span-1 space-y-6">

          {/* Participants Box (Top Right in the image) */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 max-h-[400px] overflow-y-auto">
            <h3 className="text-md font-bold text-gray-900 flex items-center justify-between mb-4">
              <span className="flex items-center gap-2">
                <User className="w-5 h-5 text-gray-500" />
                Participantes
              </span>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">
                {conversation.participants?.length || 0} na call
              </span>
            </h3>
            <div className="space-y-4">
              {conversation.participants && conversation.participants.length > 0 ? (
                conversation.participants.map((participant: string, index: number) => {
                  // Mocking some time and avatar since it's just a name string usually
                  const initials = participant.substring(0, 2).toUpperCase()
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                          {initials}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{participant}</p>
                          <p className="text-xs text-gray-500">Participante</p>
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-sm text-gray-500">Nenhum participante identificado.</p>
              )}
            </div>
          </div>

          {/* Compromissos Box */}
          {insight && (insight.commitments?.length > 0 || insight.nextActions?.length > 0) && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sticky top-6">
              <h3 className="text-md font-bold text-gray-900 flex items-center gap-2 mb-4 border-b border-gray-100 pb-4">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
                Compromissos
              </h3>

              <div className="space-y-3 mb-6">
                {/* Combina Compromissos e Next Actions */}
                {Array.from(new Set([
                  ...(insight.commitments || []),
                  ...(insight.nextActions || [])
                ])).map((item: any, idx: number) => (
                  <label key={idx} className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors group">
                    <input type="checkbox" className="mt-1 flex-shrink-0 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                    <span className="text-sm text-gray-700 leading-tight block group-hover:text-blue-900">{item}</span>
                  </label>
                ))}
              </div>

              <CreateActionsButton
                conversationId={conversation.id}
                hasDeal={!!conversation.dealId}
                hasNextActions={true}
              />
            </div>
          )}

          {/* Processamento - Info Técnica */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">
              IA & Processamento
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                {getStatusBadge(conversation.processingStatus || 'PENDING')}
              </div>
              {conversation.processingStatus === 'PENDING' && (
                <p className="text-xs text-yellow-700 bg-yellow-50 p-2 rounded">
                  Aguardando processamento...
                </p>
              )}
              {conversation.processingStatus === 'FAILED' && (
                <p className="text-xs text-red-700 bg-red-50 p-2 rounded">
                  Falha ao analisar a conversa.
                </p>
              )}
              <RetryButton
                conversationId={conversation.id}
                status={conversation.processingStatus || 'PENDING'}
              />
            </div>
          </div>

          {/* Deal Info */}
          {conversation.deal && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">
                Negócio
              </h3>
              <div className="space-y-3">
                <div>
                  <Link
                    href={`/dashboard/deals/${conversation.deal.id}`}
                    className="text-base font-semibold text-[#0091ae] hover:underline flex items-center gap-2"
                  >
                    <Target className="h-4 w-4" />
                    {conversation.deal.title}
                  </Link>
                  {conversation.deal.value && (
                    <p className="text-sm text-gray-500 mt-1">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(Number(conversation.deal.value))}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

