'use client'

import { useState } from 'react'
import {
  MessageSquare,
  Send,
  User,
  Clock,
  ChevronRight,
  StickyNote,
  Plus,
  Search
} from 'lucide-react'
import { cn } from '~/lib/utils'

const MESSAGE_TYPES = [
  { value: 'NOTE', label: 'Nota', icon: StickyNote, color: 'text-orange-600', bg: 'bg-orange-50' },
  { value: 'WHATSAPP', label: 'WhatsApp', icon: MessageSquare, color: 'text-green-600', bg: 'bg-green-50' },
]

function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface Message {
  id: string
  content: string
  type: string
  senderType: string
  senderId: string
  createdAt: string
  sender?: { id: string; name: string; email: string } | null
}

interface MessageListProps {
  dealId: string
  conversations: any[]
  currentUserId: string
  currentUserName: string
}

export default function MessageList({ dealId, conversations, currentUserId, currentUserName }: MessageListProps) {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(
    conversations.length > 0 ? conversations[0].id : null
  )
  const [showNewConversation, setShowNewConversation] = useState(false)
  const [newSubject, setNewSubject] = useState('')

  const activeConversation = conversations.find(c => c.id === selectedConversation)

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden flex flex-col h-[500px]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
        <h2 className="text-sm font-bold text-[#001d3a] flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-green-500" /> Registro de Conversas
        </h2>
        <button
          onClick={() => setShowNewConversation(true)}
          className="p-1 px-3 bg-white border border-gray-300 rounded text-[10px] font-bold text-[#001d3a] hover:bg-gray-50 transition-colors flex items-center gap-1 uppercase tracking-tight"
        >
          <Plus className="h-3 w-3" /> Nova Conversa
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Conversation Sidebar */}
        <div className="w-56 border-r border-gray-100 flex flex-col bg-gray-50/30">
          <div className="p-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Filtrar..."
                className="w-full text-xs bg-white border border-gray-200 rounded-md py-2 pl-8 pr-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv.id)}
                className={cn(
                  "w-full text-left px-4 py-3 transition-all hover:bg-white group relative",
                  selectedConversation === conv.id
                    ? "bg-white border-l-4 border-blue-600 shadow-sm"
                    : "border-l-4 border-transparent"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                    {conv.source || 'Manual'}
                  </span>
                  <ChevronRight className={cn("h-3 w-3 text-gray-300 group-hover:translate-x-0.5 transition-transform", selectedConversation === conv.id && "text-blue-500")} />
                </div>
                <p className={cn(
                  "text-xs font-bold truncate",
                  selectedConversation === conv.id ? "text-[#001d3a]" : "text-gray-600"
                )}>
                  {conv.subject || 'Sem assunto'}
                </p>
                <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                  <Clock className="h-2.5 w-2.5" /> {conv._count?.messages || 0} msgs
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col bg-white">
          {showNewConversation && (
            <div className="p-4 bg-blue-50 border-b border-blue-100 animate-in slide-in-from-top-2">
              <form action={async (formData) => {
                formData.append('dealId', dealId)
                await fetch('/api/conversations/create', {
                  method: 'POST',
                  body: formData,
                })
                setShowNewConversation(false)
                setNewSubject('')
                window.location.reload()
              }} className="space-y-3">
                <input type="hidden" name="status" value="open" />
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="subject"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="Assunto da conversa..."
                    required
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-xs font-bold hover:bg-blue-700"
                  >
                    Criar
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewConversation(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeConversation ? (
            <>
              <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-[#f8fafc]/50">
                {activeConversation.messages?.map((msg: Message) => {
                  const isOwn = msg.senderId === currentUserId
                  const typeInfo = MESSAGE_TYPES.find(t => t.value === msg.type) || MESSAGE_TYPES[0]
                  const Icon = typeInfo.icon

                  return (
                    <div
                      key={msg.id}
                      className={cn("flex flex-col", isOwn ? "items-end text-right" : "items-start text-left")}
                    >
                      <div className={cn(
                        "flex gap-3 max-w-[85%]",
                        isOwn ? "flex-row-reverse" : "flex-row"
                      )}>
                        <div className={cn(
                          "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold border",
                          isOwn
                            ? "bg-blue-600 text-white border-blue-700 shadow-md"
                            : "bg-white text-gray-600 border-gray-200"
                        )}>
                          {isOwn ? currentUserName.charAt(0) : (msg.sender?.name?.charAt(0) || <User className="h-3 w-3" />)}
                        </div>

                        <div className="space-y-1">
                          <div className={cn(
                            "rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                            isOwn
                              ? "bg-blue-600 text-white rounded-tr-none"
                              : "bg-white border border-gray-100 text-[#001d3a] rounded-tl-none"
                          )}>
                            <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                          </div>
                          <div className="flex items-center gap-2 px-1">
                            <Icon className={cn("h-3 w-3", isOwn ? "text-blue-500" : typeInfo.color)} />
                            <span className="text-[10px] font-medium text-gray-400">
                              {isOwn ? 'Eu' : (msg.sender?.name || 'Sistema')} • {formatDateTime(msg.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-gray-100">
                <form action={async (formData) => {
                  formData.append('conversationId', activeConversation.id)
                  await fetch('/api/conversations/message', {
                    method: 'POST',
                    body: formData,
                  })
                  window.location.reload()
                }} className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                  <input type="hidden" name="type" value="NOTE" />
                  <input
                    type="text"
                    name="content"
                    placeholder="Escreva uma nota ou mensagem..."
                    required
                    className="flex-1 bg-transparent border-none text-sm placeholder-gray-400 focus:ring-0 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center grayscale opacity-50">
              <MessageSquare className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-sm font-bold text-[#001d3a]">Nenhuma conversa selecionada</h3>
              <p className="text-xs text-gray-500 max-w-[200px]">Selecione um tópico ao lado para ver o histórico de mensagens.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
