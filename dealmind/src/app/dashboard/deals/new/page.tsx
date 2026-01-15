import { createClient } from '~/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createCaller } from '~/server/api/root'
import { createTRPCContext } from '~/server/api/trpc'
import { createDeal } from './actions'

export default async function NewDealPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Create tRPC caller
  const ctx = await createTRPCContext({
    supabase,
    headers: new Headers(),
  })
  const caller = createCaller(ctx)

  // Fetch contacts for the dropdown
  let contacts: any[] = []
  try {
    contacts = await caller.contact.list()
  } catch (error) {
    console.error('Error fetching contacts:', error)
  }

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
            <h1 className="text-xl font-semibold text-gray-900">Nova Negociação</h1>
          </header>

          <main className="p-6">
            <div className="mx-auto max-w-2xl">
              <form action={createDeal} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="space-y-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Título *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      required
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Ex: Implementação de sistema"
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Descrição
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Detalhes da negociação..."
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label htmlFor="value" className="block text-sm font-medium text-gray-700">
                        Valor (R$) *
                      </label>
                      <input
                        type="number"
                        id="value"
                        name="value"
                        required
                        min="0"
                        step="0.01"
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="0,00"
                      />
                    </div>

                    <div>
                      <label htmlFor="stage" className="block text-sm font-medium text-gray-700">
                        Estágio *
                      </label>
                      <select
                        id="stage"
                        name="stage"
                        defaultValue="LEAD"
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="LEAD">Lead</option>
                        <option value="QUALIFICATION">Qualificação</option>
                        <option value="PROPOSAL">Proposta</option>
                        <option value="NEGOTIATION">Negociação</option>
                        <option value="CLOSED_WON">Ganho</option>
                        <option value="CLOSED_LOST">Perdido</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                        Prioridade
                      </label>
                      <select
                        id="priority"
                        name="priority"
                        defaultValue="MEDIUM"
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="LOW">Baixa</option>
                        <option value="MEDIUM">Média</option>
                        <option value="HIGH">Alta</option>
                        <option value="URGENT">Urgente</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="expectedClose" className="block text-sm font-medium text-gray-700">
                        Previsão de Fechamento
                      </label>
                      <input
                        type="date"
                        id="expectedClose"
                        name="expectedClose"
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contactId" className="block text-sm font-medium text-gray-700">
                      Contato
                    </label>
                    <select
                      id="contactId"
                      name="contactId"
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Selecione um contato...</option>
                      {contacts.map((contact) => (
                        <option key={contact.id} value={contact.id}>
                          {contact.name} {contact.email ? `(${contact.email})` : ''}
                        </option>
                      ))}
                    </select>
                    {contacts.length === 0 && (
                      <p className="mt-1 text-sm text-gray-500">
                        Nenhum contato encontrado. <Link href="/dashboard/contacts/new" className="text-blue-600 hover:underline">Criar contato</Link>
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Link
                      href="/dashboard/deals"
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancelar
                    </Link>
                    <button
                      type="submit"
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      Criar Negociação
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
