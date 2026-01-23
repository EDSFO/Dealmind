import { createClient } from '~/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createCaller } from '~/server/api/root'
import { createTRPCContext } from '~/server/api/trpc'
import { ChevronDown, Plus, Filter, List as ListIcon, MessageSquare, Zap, Phone, FileText, CheckCircle2, Clock } from 'lucide-react'

export default async function ConversationsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const ctx = await createTRPCContext({
    headers: new Headers(),
  })
  const caller = createCaller(ctx)

  const conversations = await caller.conversation.list()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="inline-flex items-center rounded-md bg-yellow-50 px-2.5 py-1 text-[10px] font-bold text-yellow-700 uppercase tracking-tight border border-yellow-200">Pendente</span>
      case 'PROCESSING':
        return <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700 uppercase tracking-tight border border-blue-200">Processando</span>
      case 'COMPLETED':
        return <span className="inline-flex items-center rounded-md bg-green-50 px-2.5 py-1 text-[10px] font-bold text-green-700 uppercase tracking-tight border border-green-200">Concluído</span>
      case 'FAILED':
        return <span className="inline-flex items-center rounded-md bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-700 uppercase tracking-tight border border-red-200">Falhou</span>
      default:
        return <span className="inline-flex items-center rounded-md bg-gray-50 px-2.5 py-1 text-[10px] font-bold text-gray-700 uppercase tracking-tight border border-gray-200">{status}</span>
    }
  }

  const getSourceIcon = (source: string) => {
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

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] overflow-hidden">
      {/* Top Title Bar */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-[#001d3a] flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 -ml-2 rounded transition-colors group">
            Conversas
            <ChevronDown className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            Ações <ChevronDown className="h-4 w-4" />
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            Sincronizar
          </button>
          <Link
            href="/dashboard/conversations/new"
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#ff5c35] rounded-md hover:bg-[#e04d2b] transition-colors shadow-sm"
          >
            Nova conversa
          </Link>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="bg-white border-b px-6 flex items-center justify-between h-12 min-h-[48px]">
        <div className="flex items-center gap-6 h-full">
          <button className="text-sm font-semibold text-[#001d3a] border-b-2 border-orange-500 h-full flex items-center">
            Todas as conversas
          </button>
          <button className="text-sm font-medium text-gray-500 hover:text-gray-700 h-full flex items-center">
            Minhas conversas
          </button>
          <button className="text-sm font-medium text-blue-600 hover:text-blue-700 h-full flex items-center gap-1">
            <Plus className="h-4 w-4" /> Adicionar visualização
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border-b px-6 py-3 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-md border border-gray-200">
            <button className="p-1.5 rounded bg-white shadow-sm transition-all"><ListIcon className="h-4 w-4 text-[#001d3a]" /></button>
          </div>

          <div className="flex items-center gap-2 ml-2 flex-wrap">
            <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-md">
              Proprietário (Eu) <ChevronDown className="h-3 w-3" />
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              Data da conversa <ChevronDown className="h-3 w-3" />
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              Origem <ChevronDown className="h-3 w-3" />
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              Status <ChevronDown className="h-3 w-3" />
            </button>
            <button className="text-xs font-medium text-gray-500 hover:text-gray-700 ml-1">
              + Mais
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 ml-auto">
          <button className="flex items-center gap-2 text-xs font-medium text-blue-600 hover:text-blue-700">
            <Filter className="h-4 w-4" /> Filtros avançados
          </button>
        </div>
      </div>

      {/* List Container */}
      <div className="flex-1 bg-[#f5f8fa] p-6 overflow-auto">
        {conversations.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50">
              <MessageSquare className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-[#001d3a]">Nenhuma conversa encontrada</h3>
            <p className="mt-2 text-gray-500 max-w-sm">Integre com o WhatsApp ou Fireflies para processar suas conversas com IA automaticamente.</p>
            <div className="mt-6 flex gap-3">
              <button className="px-6 py-3 rounded-md border border-gray-300 bg-white font-semibold hover:bg-gray-50 transition-all">
                Conectar Integração
              </button>
              <Link
                href="/dashboard/conversations/new"
                className="px-6 py-3 rounded-md bg-[#ff5c35] text-white font-semibold hover:bg-[#e04d2b] transition-all"
              >
                Criar manual
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Assunto / Data</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Origem</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Contato / Negócio</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Insights IA</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-[11px] font-bold text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {conversations.map((conversation) => (
                    <tr key={conversation.id} className="hover:bg-blue-50/30 transition-colors group cursor-pointer">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-[#0091ae] group-hover:underline">
                            {conversation.subject || 'Conversa sem assunto'}
                          </span>
                          <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5">
                            <Clock className="h-3 w-3" />
                            {conversation.conversationDate ? new Date(conversation.conversationDate).toLocaleDateString('pt-BR') : 'Sem data'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase">
                          {getSourceIcon(conversation.source)}
                          {conversation.source}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">
                            {conversation.contact?.name || '-'}
                          </span>
                          <span className="text-[11px] text-gray-500">
                            {conversation.deal?.title || 'Sem negócio vinculado'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {conversation.processingStatus === 'COMPLETED' ? (
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 rounded border border-green-100">
                              <CheckCircle2 className="h-3 w-3 text-green-600" />
                              <span className="text-[10px] font-bold text-green-700 uppercase">Gerados</span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Aguardando...</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(conversation.processingStatus || 'PENDING')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/dashboard/conversations/${conversation.id}`}
                          className="text-xs font-bold text-blue-600 hover:text-blue-800 uppercase tracking-tight"
                        >
                          Ver detalhes
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
