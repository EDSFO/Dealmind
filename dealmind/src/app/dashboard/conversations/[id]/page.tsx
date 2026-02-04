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

  const insight = conversation?.insight || null

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
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column: Main Content */}
          <div className="xl:col-span-2 space-y-6">
            {/* Transcription */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#001d3a] flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Transcrição
                </h2>
              </div>
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans bg-gray-50 p-4 rounded-md border border-gray-200">
                  {conversation.transcriptionText || 'Nenhuma transcrição disponível'}
                </pre>
              </div>
            </div>

            {/* Messages */}
            {conversation.messages && conversation.messages.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <h2 className="text-lg font-bold text-[#001d3a] flex items-center gap-2 mb-4">
                  <MessageSquare className="h-5 w-5" />
                  Mensagens ({conversation.messages.length})
                </h2>
                <div className="space-y-4">
                  {conversation.messages.map((message: any) => (
                    <div
                      key={message.id}
                      className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded-r-md"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-gray-600 uppercase">
                          {message.type}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(message.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{message.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Participants */}
            {conversation.participants && conversation.participants.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <h2 className="text-lg font-bold text-[#001d3a] flex items-center gap-2 mb-4">
                  <User className="h-5 w-5" />
                  Participantes
                </h2>
                <div className="flex flex-wrap gap-2">
                  {conversation.participants.map((participant: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-50 text-blue-700 rounded-md text-sm font-medium"
                    >
                      {participant}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* AI Insights */}
            {insight && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <h2 className="text-lg font-bold text-[#001d3a] flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-orange-500" />
                  Insights da IA
                </h2>

                {/* Summary */}
                {insight.summary && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                    <h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Resumo Executivo
                    </h3>
                    <p className="text-sm text-blue-800 leading-relaxed">{insight.summary}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Interests */}
                  {insight.interests && Array.isArray(insight.interests) && insight.interests.length > 0 && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                      <h3 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        Interesses
                      </h3>
                      <ul className="space-y-1">
                        {insight.interests.map((interest: string, index: number) => (
                          <li key={index} className="text-sm text-green-700 flex items-start gap-2">
                            <span className="text-green-400 mt-0.5">•</span>
                            <span className="line-clamp-2">{interest}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Objections */}
                  {insight.objections && Array.isArray(insight.objections) && insight.objections.length > 0 && (
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                      <h3 className="text-sm font-semibold text-yellow-800 mb-2 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        Objeções
                      </h3>
                      <ul className="space-y-1">
                        {insight.objections.map((objection: string, index: number) => (
                          <li key={index} className="text-sm text-yellow-700 flex items-start gap-2">
                            <span className="text-yellow-400 mt-0.5">•</span>
                            <span className="line-clamp-2">{objection}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Commitments */}
                  {insight.commitments && Array.isArray(insight.commitments) && insight.commitments.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4 text-blue-500" />
                        Compromissos
                      </h3>
                      <ul className="space-y-1">
                        {insight.commitments.map((commitment: string, index: number) => (
                          <li key={index} className="text-sm text-gray-600 flex items-center gap-1">
                            <ArrowRight className="h-3 w-3 text-blue-500" />
                            {commitment}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Next Actions */}
                  {insight.nextActions && Array.isArray(insight.nextActions) && insight.nextActions.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                        <ArrowRight className="h-4 w-4 text-orange-500" />
                        Próximas Ações
                      </h3>
                      <ul className="space-y-1">
                        {insight.nextActions.map((action: string, index: number) => (
                          <li key={index} className="text-sm text-gray-600 flex items-center gap-1">
                            <ArrowRight className="h-3 w-3 text-orange-500" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Progress Signals */}
                {insight.progressSignals && Array.isArray(insight.progressSignals) && insight.progressSignals.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      Sinais de Progresso
                    </h3>
                    <div className="space-y-2">
                      {insight.progressSignals.map((signal: any, index: number) => (
                        <div key={index} className="p-2 bg-green-50 rounded border border-green-200">
                          <p className="text-sm text-green-800">{signal.signal}</p>
                          {signal.confidence && (
                            <p className="text-xs text-green-600 mt-1">
                              Confiança: {Math.round(signal.confidence * 100)}%
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Risk Signals */}
                {insight.riskSignals && Array.isArray(insight.riskSignals) && insight.riskSignals.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      Sinais de Risco
                    </h3>
                    <div className="space-y-2">
                      {insight.riskSignals.map((signal: any, index: number) => (
                        <div
                          key={index}
                          className={`p-2 rounded border ${
                            signal.severity === 'high'
                              ? 'bg-red-50 border-red-200'
                              : signal.severity === 'medium'
                                ? 'bg-yellow-50 border-yellow-200'
                                : 'bg-orange-50 border-orange-200'
                          }`}
                        >
                          <p
                            className={`text-sm ${
                              signal.severity === 'high'
                                ? 'text-red-800'
                                : signal.severity === 'medium'
                                  ? 'text-yellow-800'
                                  : 'text-orange-800'
                            }`}
                          >
                            {signal.signal}
                          </p>
                          <p
                            className={`text-xs mt-1 ${
                              signal.severity === 'high'
                                ? 'text-red-600'
                                : signal.severity === 'medium'
                                  ? 'text-yellow-600'
                                  : 'text-orange-600'
                            }`}
                          >
                            Severidade: {signal.severity === 'high' ? 'Alta' : signal.severity === 'medium' ? 'Média' : 'Baixa'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* Contact Info */}
            {conversation.contact && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">
                  Contato
                </h3>
                <div className="space-y-3">
                  <div>
                    <Link
                      href={`/dashboard/contacts/${conversation.contact.id}`}
                      className="text-base font-semibold text-[#0091ae] hover:underline flex items-center gap-2"
                    >
                      <User className="h-4 w-4" />
                      {conversation.contact.name || 'Sem nome'}
                    </Link>
                    {conversation.contact.email && (
                      <p className="text-sm text-gray-500 mt-1">{conversation.contact.email}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Deal Info */}
            {conversation.deal && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
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

            {/* Processing Status */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">
                Status do Processamento
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  {getStatusBadge(conversation.processingStatus || 'PENDING')}
                </div>
                {conversation.processingStatus === 'PENDING' && (
                  <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-md border border-yellow-200">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-yellow-800">
                        Aguardando processamento
                      </p>
                      <p className="text-xs text-yellow-700 mt-1">
                        A conversa será processada pela IA em breve.
                      </p>
                    </div>
                  </div>
                )}
                {conversation.processingStatus === 'PROCESSING' && (
                  <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-md border border-blue-200">
                    <Clock className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-blue-800">Processando</p>
                      <p className="text-xs text-blue-700 mt-1">
                        A IA está analisando a conversa...
                      </p>
                    </div>
                  </div>
                )}
                {conversation.processingStatus === 'COMPLETED' && (
                  <div className="flex items-start gap-2 p-3 bg-green-50 rounded-md border border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-green-800">Processado</p>
                      <p className="text-xs text-green-700 mt-1">
                        Insights gerados com sucesso.
                      </p>
                    </div>
                  </div>
                )}
                {conversation.processingStatus === 'FAILED' && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 rounded-md border border-red-200">
                    <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-red-800">Falha no processamento</p>
                      <p className="text-xs text-red-700 mt-1">
                        Ocorreu um erro ao processar a conversa.
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Botão de Reenviar */}
                <RetryButton
                  conversationId={conversation.id}
                  status={conversation.processingStatus || 'PENDING'}
                />
              </div>
            </div>

            {/* Metadata */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">
                Informações
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Criado em</span>
                  <span className="text-gray-900 font-medium">
                    {formatDate(conversation.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Atualizado em</span>
                  <span className="text-gray-900 font-medium">
                    {formatDate(conversation.updatedAt)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Origem</span>
                  <span className="text-gray-900 font-medium uppercase">
                    {conversation.source}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

