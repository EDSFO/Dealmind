import { createClient } from '~/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createCaller } from '~/server/api/root'
import { createTRPCContext } from '~/server/api/trpc'
import { ChevronDown, Plus, Filter, List as ListIcon, UserPlus, Mail, Phone, Building2 } from 'lucide-react'

function formatDate(date: Date | string): string {
  if (!date) return '-'
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
    <div className="flex flex-col min-h-[calc(100vh-64px)] overflow-hidden">
      {/* Top Title Bar */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-[#001d3a] flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 -ml-2 rounded transition-colors group">
            Contatos
            <ChevronDown className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            Ações <ChevronDown className="h-4 w-4" />
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            Importar
          </button>
          <Link
            href="/dashboard/contacts/new"
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#ff5c35] rounded-md hover:bg-[#e04d2b] transition-colors shadow-sm"
          >
            Criar contato
          </Link>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="bg-white border-b px-6 flex items-center justify-between h-12 min-h-[48px]">
        <div className="flex items-center gap-6 h-full">
          <button className="text-sm font-semibold text-[#001d3a] border-b-2 border-orange-500 h-full flex items-center">
            Todos os contatos
          </button>
          <button className="text-sm font-medium text-gray-500 hover:text-gray-700 h-full flex items-center">
            Meus contatos
          </button>
          <button className="text-sm font-medium text-blue-600 hover:text-blue-700 h-full flex items-center gap-1">
            <Plus className="h-4 w-4" /> Adicionar visualização
          </button>
          <button className="text-sm font-medium text-gray-500 hover:text-gray-700 h-full flex items-center">
            Todas as exibições
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border-b px-6 py-3 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-md border border-gray-200">
            <button className="p-1.5 rounded hover:bg-white hover:shadow-sm transition-all bg-white shadow-sm"><ListIcon className="h-4 w-4 text-[#001d3a]" /></button>
          </div>

          <div className="flex items-center gap-2 ml-2 flex-wrap">
            <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-md">
              Proprietário do contato (1) <ChevronDown className="h-3 w-3" />
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              Data de criação <ChevronDown className="h-3 w-3" />
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              Data da última atividade <ChevronDown className="h-3 w-3" />
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              Status do lead <ChevronDown className="h-3 w-3" />
            </button>
            <button className="text-xs font-medium text-gray-500 hover:text-gray-700 ml-1">
              + Mais
            </button>
            <button className="text-xs font-medium text-red-500 hover:text-red-700 ml-1">
              Apagar tudo
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 ml-auto">
          <button className="flex items-center gap-2 text-xs font-medium text-blue-600 hover:text-blue-700">
            <Filter className="h-4 w-4" /> Filtros avançados
          </button>
        </div>
      </div>

      {/* Metrics Summary Bar */}
      <div className="bg-white border-b px-6 py-6 overflow-x-auto">
        <div className="flex items-center justify-between min-w-max gap-8 px-4">
          <div className="text-center flex-1">
            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1">TOTAL DE CONTATOS</p>
            <h3 className="text-2xl font-bold text-[#001d3a]">{stats?.total || 0}</h3>
            <p className="text-xs text-green-600 mt-0.5">+{stats?.total || 0} este mês</p>
          </div>
          <div className="w-px h-12 bg-gray-200" />
          <div className="text-center flex-1">
            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1">COM EMAIL</p>
            <h3 className="text-2xl font-bold text-[#001d3a]">{stats?.withEmail || 0}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{(((stats?.withEmail || 0) / (stats?.total || 1)) * 100).toFixed(0)}% do total</p>
          </div>
          <div className="w-px h-12 bg-gray-200" />
          <div className="text-center flex-1">
            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1">COM TELEFONE</p>
            <h3 className="text-2xl font-bold text-[#001d3a]">{stats?.withPhone || 0}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{(((stats?.withPhone || 0) / (stats?.total || 1)) * 100).toFixed(0)}% do total</p>
          </div>
          <div className="w-px h-12 bg-gray-200" />
          <div className="text-center flex-1">
            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1">QUALIFICAÇÃO MÉDIA</p>
            <h3 className="text-2xl font-bold text-[#001d3a]">85%</h3>
            <p className="text-xs text-green-600 mt-0.5">Alto potencial</p>
          </div>
        </div>
      </div>

      {/* List Container */}
      <div className="flex-1 bg-[#f5f8fa] p-6 overflow-auto">
        {contacts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50">
              <UserPlus className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-[#001d3a]">Nenhum contato encontrado</h3>
            <p className="mt-2 text-gray-500 max-w-sm">Comece a adicionar contatos para gerenciar seus leads e negociações.</p>
            <Link
              href="/dashboard/contacts/new"
              className="mt-6 px-6 py-3 rounded-md bg-[#ff5c35] text-white font-semibold hover:bg-[#e04d2b] transition-all"
            >
              Criar primeiro contato
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Nome</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Telefone</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Empresa</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Origem</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Negócios</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Criado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {contacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-blue-50/30 transition-colors group cursor-pointer">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold border border-blue-200">
                            {contact.name?.charAt(0) || 'C'}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-bold text-[#0091ae] group-hover:underline">{contact.name}</p>
                            <p className="text-[11px] text-gray-500">{contact.position || 'Sem cargo'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-3.5 w-3.5 text-gray-400" />
                          {contact.email || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="h-3.5 w-3.5 text-gray-400" />
                          {contact.phone || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                          <Building2 className="h-3.5 w-3.5 text-gray-400" />
                          {contact.company || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-[10px] font-bold text-gray-600 uppercase tracking-tight">
                          {contact.source || 'Manual'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-bold text-[#001d3a] text-sm">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          {contact._count?.deals || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(contact.createdAt)}
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
