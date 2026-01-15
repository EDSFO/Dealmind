'use client'

import { useState } from 'react'

const MESSAGE_TYPES = [
  { value: 'NOTE', label: 'Nota', icon: '📝' },
  { value: 'EMAIL', label: 'Email', icon: '📧' },
  { value: 'CALL', label: 'Ligação', icon: '📞' },
  { value: 'MEETING', label: 'Reunião', icon: '👥' },
  { value: 'WHATSAPP', label: 'WhatsApp', icon: '💬' },
]

function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
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
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Conversas</h2>
        <button
          onClick={() => setShowNewConversation(true)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          + Nova
        </button>
      </div>

      {/* New Conversation Modal */}
      {showNewConversation && (
        <div className="p-4 bg-gray-50 border-b">
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
            <div>
              <input
                type="text"
                name="subject"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="Assunto da conversa"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowNewConversation(false)}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Criar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Conversation List */}
      {conversations.length > 0 ? (
        <div className="flex">
          {/* Conversation List Sidebar */}
          <div className="w-48 border-r border-gray-100 max-h-96 overflow-y-auto">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv.id)}
                className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 ${
                  selectedConversation === conv.id ? 'bg-blue-50' : ''
                }`}
              >
                <p className={`text-sm font-medium truncate ${
                  selectedConversation === conv.id ? 'text-blue-700' : 'text-gray-900'
                }`}>
                  {conv.subject || 'Sem assunto'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {conv._count?.messages || 0} msgs
                </p>
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <div className="flex-1 flex flex-col max-h-96">
            {activeConversation ? (
              <>
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {activeConversation.messages && activeConversation.messages.length > 0 ? (
                    activeConversation.messages.map((msg: Message) => {
                      const isOwn = msg.senderId === currentUserId
                      const typeInfo = MESSAGE_TYPES.find(t => t.value === msg.type) || MESSAGE_TYPES[0]

                      return (
                        <div
                          key={msg.id}
                          className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
                        >
                          <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-sm ${
                            isOwn ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {isOwn ? currentUserName.charAt(0) : (msg.sender?.name?.charAt(0) || 'U')}
                          </div>
                          <div className={`max-w-[70%] ${isOwn ? 'text-right' : ''}`}>
                            <div className={`inline-block rounded-lg px-4 py-2 text-sm ${
                              isOwn ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'
                            }`}>
                              <p>{msg.content}</p>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {typeInfo.icon} {isOwn ? 'Você' : msg.sender?.name || 'Sistema'} • {formatDateTime(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-center text-sm text-gray-500 py-8">
                      Nenhuma mensagem ainda.
                    </p>
                  )}
                </div>

                {/* Message Input */}
                <form action={async (formData) => {
                  formData.append('conversationId', activeConversation.id)
                  await fetch('/api/conversations/message', {
                    method: 'POST',
                    body: formData,
                  })
                  window.location.reload()
                }} className="p-4 border-t border-gray-100 flex gap-2">
                  <input type="hidden" name="type" value="NOTE" />
                  <input
                    type="text"
                    name="content"
                    placeholder="Digite uma mensagem..."
                    required
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Enviar
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-gray-500">Selecione uma conversa</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center">
          <div className="text-4xl mb-2">💬</div>
          <p className="text-sm text-gray-500">Nenhuma conversa ainda.</p>
          <button
            onClick={() => setShowNewConversation(true)}
            className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Criar primeira conversa
          </button>
        </div>
      )}
    </div>
  )
}
