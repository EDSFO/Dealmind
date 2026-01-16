import { createClient } from '~/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createCaller } from '~/server/api/root'
import { createTRPCContext } from '~/server/api/trpc'
import { createManualConversation } from './actions'

export default async function NewConversationPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Fetch contacts and deals for dropdowns
  const ctx = await createTRPCContext({
    supabase,
    headers: new Headers(),
  })
  const caller = createCaller(ctx)

  const [contacts, deals] = await Promise.all([
    caller.contact.list().catch(() => []),
    caller.deal.list().catch(() => []),
  ])

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
            <Link href="/dashboard/contacts" className="flex items-center gap-3 rounded-lg px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Contatos
            </Link>
            <Link href="/dashboard/deals" className="flex items-center gap-3 rounded-lg px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Negociações
            </Link>
            <Link href="/dashboard/conversations" className="flex items-center gap-3 rounded-lg bg-blue-600 px-4 py-3 text-white font-medium">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Conversas
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 pl-64">
          <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-white px-6">
            <Link href="/dashboard/conversations" className="mr-4 text-gray-400 hover:text-gray-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">Nova Conversa (Manual)</h1>
          </header>

          <main className="p-6">
            <div className="mx-auto max-w-3xl">
              <div className="mb-4 rounded-lg bg-blue-50 border border-blue-200 p-4">
                <div className="flex">
                  <svg className="h-5 w-5 text-blue-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-blue-800">Análise de IA</h3>
                    <p className="mt-1 text-sm text-blue-700">
                      Após criar a conversa, a IA analisará automaticamente a transcrição para extrair interesses, objeções, compromissos e sinais de risco/progresso.
                    </p>
                  </div>
                </div>
              </div>

              <form action={createManualConversation} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label htmlFor="contactId" className="block text-sm font-medium text-gray-700">
                        Contato
                      </label>
                      <select
                        id="contactId"
                        name="contactId"
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Selecione um contato (opcional)</option>
                        {contacts.map((contact) => (
                          <option key={contact.id} value={contact.id}>
                            {contact.name} {contact.email ? `(${contact.email})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="dealId" className="block text-sm font-medium text-gray-700">
                        Negociação
                      </label>
                      <select
                        id="dealId"
                        name="dealId"
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Selecione uma negociação (opcional)</option>
                        {deals.map((deal) => (
                          <option key={deal.id} value={deal.id}>
                            {deal.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                      Assunto
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Ex: Reunião de follow-up, Call de vendas..."
                    />
                  </div>

                  <div>
                    <label htmlFor="conversationDate" className="block text-sm font-medium text-gray-700">
                      Data da Conversa
                    </label>
                    <input
                      type="date"
                      id="conversationDate"
                      name="conversationDate"
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="participants" className="block text-sm font-medium text-gray-700">
                      Participantes
                    </label>
                    <input
                      type="text"
                      id="participants"
                      name="participants"
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Separe por vírgula: João, Maria, Pedro..."
                    />
                    <p className="mt-1 text-xs text-gray-500">Nomes das pessoas que participaram da conversa</p>
                  </div>

                  <div>
                    <label htmlFor="transcriptionText" className="block text-sm font-medium text-gray-700">
                      Transcrição da Conversa *
                    </label>
                    <textarea
                      id="transcriptionText"
                      name="transcriptionText"
                      required
                      rows={12}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-sm"
                      placeholder="Cole aqui a transcrição da conversa...

Exemplo:
João: Olá, obrigado por agendar esta reunião.
Maria: Por nada! Estou animada em aprender mais sobre a solução.
João: Perfeito. Vou começar apresentando nossos recursos principais...
...
"
                    />
                    <p className="mt-1 text-xs text-gray-500">A transcrição será analisada pela IA para extrair insights automáticos.</p>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Link
                      href="/dashboard/conversations"
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancelar
                    </Link>
                    <button
                      type="submit"
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 flex items-center gap-2"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Criar e Analisar
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
