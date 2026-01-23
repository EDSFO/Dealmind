import { createClient } from '~/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { api } from '~/trpc/server'
import { TRPCError } from '@trpc/server'
import { ChevronDown, Plus, Filter, List as ListIcon, Users, UserCog, Mail, ShieldCheck, Clock } from 'lucide-react'

function getRoleBadge(role: string | null) {
  switch (role) {
    case 'ADMIN':
      return <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-[10px] font-bold text-purple-700 uppercase tracking-tight border border-purple-200">Administrador</span>
    case 'LIDER':
      return <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700 uppercase tracking-tight border border-blue-200">Líder</span>
    case 'VENDEDOR':
      return <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-[10px] font-bold text-green-700 uppercase tracking-tight border border-green-200">Vendedor</span>
    default:
      return <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-[10px] font-bold text-gray-700 uppercase tracking-tight border border-gray-200">Não definido</span>
  }
}

export default async function UsersPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  let users: any[] = []
  let stats: any = null
  let errorMessage: string | null = null

  try {
    users = await api.user.list()
    stats = await api.user.stats()
  } catch (error) {
    if (error instanceof TRPCError) {
      errorMessage = error.message
    }
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] overflow-hidden">
      {/* Top Title Bar */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-[#001d3a] flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 -ml-2 rounded transition-colors group">
            Configurações de Usuários
            <ChevronDown className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            Gerenciar Cargos
          </button>
          <Link
            href="/dashboard/users/new"
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#ff5c35] rounded-md hover:bg-[#e04d2b] transition-colors shadow-sm"
          >
            Convidar usuário
          </Link>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="bg-white border-b px-6 flex items-center justify-between h-12 min-h-[48px]">
        <div className="flex items-center gap-6 h-full">
          <button className="text-sm font-semibold text-[#001d3a] border-b-2 border-orange-500 h-full flex items-center">
            Usuários ativos
          </button>
          <button className="text-sm font-medium text-gray-500 hover:text-gray-700 h-full flex items-center">
            Convites pendentes
          </button>
          <button className="text-sm font-medium text-gray-500 hover:text-gray-700 h-full flex items-center">
            Usuários removidos
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
              Equipe (Todas) <ChevronDown className="h-3 w-3" />
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              Função <ChevronDown className="h-3 w-3" />
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              Data de entrada <ChevronDown className="h-3 w-3" />
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
          <div className="text-center flex-1 pr-8">
            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1">TOTAL DE USUÁRIOS</p>
            <h3 className="text-2xl font-bold text-[#001d3a]">{stats?.total || 0}</h3>
          </div>
          <div className="w-px h-12 bg-gray-200" />
          <div className="text-center flex-1 px-8">
            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1 text-purple-600">ADMINISTRADORES</p>
            <h3 className="text-2xl font-bold text-purple-700">{stats?.adms || 0}</h3>
          </div>
          <div className="w-px h-12 bg-gray-200" />
          <div className="text-center flex-1 px-8">
            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1 text-blue-600">LÍDERES</p>
            <h3 className="text-2xl font-bold text-blue-700">{stats?.lideres || 0}</h3>
          </div>
          <div className="w-px h-12 bg-gray-200" />
          <div className="text-center flex-1 pl-8">
            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1 text-green-600">VENDEDORES</p>
            <h3 className="text-2xl font-bold text-green-700">{stats?.vendedors || 0}</h3>
          </div>
        </div>
      </div>

      {/* List Container */}
      <div className="flex-1 bg-[#f5f8fa] p-6 overflow-auto">
        {errorMessage && (
          <div className="mb-6 rounded-lg bg-yellow-50 border border-yellow-200 p-4 flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-yellow-500" />
            <p className="text-sm text-yellow-700 font-medium">{errorMessage}</p>
          </div>
        )}

        {users.length === 0 && !errorMessage ? (
          <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50">
              <Users className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-[#001d3a]">Inicie sua equipe</h3>
            <p className="mt-2 text-gray-500 max-w-sm">Convide seus colaboradores para começarem a utilizar o DealMind juntos.</p>
            <Link
              href="/dashboard/users/new"
              className="mt-6 px-6 py-3 rounded-md bg-[#ff5c35] text-white font-semibold hover:bg-[#e04d2b] transition-all"
            >
              Convidar agora
            </Link>
          </div>
        ) : users.length > 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Membro da Equipe</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Função / Cargo</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Acesso desde</th>
                    <th className="px-6 py-4 text-right text-[11px] font-bold text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-blue-50/30 transition-colors group cursor-pointer">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold border border-blue-100 group-hover:bg-blue-100 transition-colors">
                            {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-bold text-[#001d3a]">{user.name || 'Sem nome'}</p>
                            <p className="text-[10px] text-gray-400 font-mono tracking-tighter">ID: {user.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-3.5 w-3.5 text-gray-400" />
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-gray-300" />
                          {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/dashboard/users/${user.id}`}
                            className="rounded-lg p-2 text-gray-400 hover:bg-white hover:text-[#0091ae] hover:shadow-sm transition-all"
                          >
                            <UserCog className="h-4 w-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
