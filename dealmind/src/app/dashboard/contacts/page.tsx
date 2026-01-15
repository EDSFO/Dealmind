import { createClient } from '~/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createCaller } from '~/server/api/root'
import { createTRPCContext } from '~/server/api/trpc'

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default async function ContactsPage() {
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

  let contacts: any[] = []
  let stats: any = null

  try {
    contacts = await caller.contact.list()
    stats = await caller.contact.stats()
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
            <Link href="/dashboard/contacts" className="flex items-center gap-3 rounded-lg bg-blue-600 px-4 py-3 text-white font-medium">
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
            <Link href="/dashboard/companies" className="flex items-center gap-3 rounded-lg px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Empresas
            </Link>
            <Link href="/dashboard/users" className="flex items-center gap-3 rounded-lg px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Usuários
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 pl-64">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-6">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-gray-900">Contatos</h1>
            </div>
            <Link
              href="/dashboard/contacts/new"
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Novo Contato
            </Link>
          </header>

          <main className="p-6">
            {/* Stats */}
            <div className="mb-6 grid gap-4 md:grid-cols-4">
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <p className="text-sm text-gray-500">Total de Contatos</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{stats?.total || 0}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <p className="text-sm text-gray-500">Com Email</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{stats?.withEmail || 0}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <p className="text-sm text-gray-500">Com Telefone</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{stats?.withPhone || 0}</p>
              </div>
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
                <p className="text-sm text-blue-700">Com Email e Telefone</p>
                <p className="mt-1 text-2xl font-bold text-blue-700">
                  {stats ? (stats.withEmail && stats.withPhone ? Math.min(stats.withEmail, stats.withPhone) : 0) : 0}
                </p>
              </div>
            </div>

            {/* Contacts List */}
            {contacts.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Nenhum contato ainda</h3>
                <p className="mt-1 text-sm text-gray-500">Comece a adicionar contatos para gerenciar seus leads.</p>
                <Link
                  href="/dashboard/contacts/new"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Criar primeiro contato
                </Link>
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-gray-100 bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Origem</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deals</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Criado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {contacts.map((contact) => (
                        <tr key={contact.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                                {contact.name?.charAt(0) || 'C'}
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                                {contact.position && (
                                  <p className="text-xs text-gray-500">{contact.position}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {contact.email ? (
                              <a href={`mailto:${contact.email}`} className="text-sm text-blue-600 hover:underline">
                                {contact.email}
                              </a>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {contact.phone ? (
                              <a href={`tel:${contact.phone}`} className="text-sm text-blue-600 hover:underline">
                                {contact.phone}
                              </a>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">{contact.company || '-'}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                              {contact.source || 'Manual'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">{contact._count?.deals || 0}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-500">{formatDate(contact.createdAt)}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
