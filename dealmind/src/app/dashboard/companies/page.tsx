import { createClient } from '~/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { api } from '~/trpc/server'
import { DeleteButton } from './delete-button'
import { ChevronDown, Plus, Filter, List as ListIcon, Building2, Users, Globe, MapPin } from 'lucide-react'

export default async function CompaniesPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Buscar empresas via tRPC
  const companies = await api.company.list()

  const totalCompanies = companies.length
  const companiesWithUsers = companies.filter(c => c._count.users > 0).length

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] overflow-hidden">
      {/* Top Title Bar */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-[#001d3a] flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 -ml-2 rounded transition-colors group">
            Empresas
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
            href="/dashboard/companies/new"
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#ff5c35] rounded-md hover:bg-[#e04d2b] transition-colors shadow-sm"
          >
            Criar empresa
          </Link>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="bg-white border-b px-6 flex items-center justify-between h-12 min-h-[48px]">
        <div className="flex items-center gap-6 h-full">
          <button className="text-sm font-semibold text-[#001d3a] border-b-2 border-orange-500 h-full flex items-center">
            Todas as empresas
          </button>
          <button className="text-sm font-medium text-gray-500 hover:text-gray-700 h-full flex items-center">
            Minhas empresas
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
            <button className="p-1.5 rounded bg-white shadow-sm transition-all"><ListIcon className="h-4 w-4 text-[#001d3a]" /></button>
          </div>

          <div className="flex items-center gap-2 ml-2 flex-wrap">
            <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-md">
              Proprietário da empresa (1) <ChevronDown className="h-3 w-3" />
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              Data de criação <ChevronDown className="h-3 w-3" />
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              Data da última atividade <ChevronDown className="h-3 w-3" />
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              Cidade <ChevronDown className="h-3 w-3" />
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
            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1">TOTAL DE EMPRESAS</p>
            <h3 className="text-2xl font-bold text-[#001d3a]">{totalCompanies}</h3>
            <p className="text-xs text-green-600 mt-0.5">+{totalCompanies} esta semana</p>
          </div>
          <div className="w-px h-12 bg-gray-200" />
          <div className="text-center flex-1">
            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1">COM USUÁRIOS ATIVOS</p>
            <h3 className="text-2xl font-bold text-[#001d3a]">{companiesWithUsers}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{((companiesWithUsers / (totalCompanies || 1)) * 100).toFixed(0)}% da base</p>
          </div>
          <div className="w-px h-12 bg-gray-200" />
          <div className="text-center flex-1">
            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1">RENDA ANUAL ESTIMADA</p>
            <h3 className="text-2xl font-bold text-[#001d3a]">R$ 2,4 mi</h3>
            <p className="text-xs text-blue-600 mt-0.5">Previsão 2026</p>
          </div>
          <div className="w-px h-12 bg-gray-200" />
          <div className="text-center flex-1">
            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1">TEMPO MÉDIO DE RETENÇÃO</p>
            <h3 className="text-2xl font-bold text-[#001d3a]">18 meses</h3>
            <p className="text-xs text-gray-500 mt-0.5">LTV Médio</p>
          </div>
        </div>
      </div>

      {/* List Container */}
      <div className="flex-1 bg-[#f5f8fa] p-6 overflow-auto">
        {companies.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50">
              <Building2 className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-[#001d3a]">Nenhuma empresa encontrada</h3>
            <p className="mt-2 text-gray-500 max-w-sm">Adicione empresas para organizar seus contatos e negócios de forma eficiente.</p>
            <Link
              href="/dashboard/companies/new"
              className="mt-6 px-6 py-3 rounded-md bg-[#ff5c35] text-white font-semibold hover:bg-[#e04d2b] transition-all"
            >
              Criar primeira empresa
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Nome da Empresa</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Usuários</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Localização</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Site</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Última Atividade</th>
                    <th className="px-6 py-4 text-right text-[11px] font-bold text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {companies.map((company) => (
                    <tr key={company.id} className="hover:bg-blue-50/30 transition-colors group cursor-pointer">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 font-bold border border-blue-100">
                            {company.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#0091ae] group-hover:underline">{company.name}</p>
                            <p className="text-[10px] text-gray-400 font-mono tracking-tighter">ID: {company.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-[#001d3a]">
                          <Users className="h-3.5 w-3.5 text-gray-400" />
                          {company._count.users}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <MapPin className="h-3.5 w-3.5 text-gray-400" />
                          São Paulo, SP
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
                          <Globe className="h-3.5 w-3.5 text-gray-400" />
                          {company.name.toLowerCase().replace(/\s/g, '')}.com.br
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(company.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/dashboard/companies/${company.id}`}
                            className="rounded-lg p-2 text-gray-400 hover:bg-white hover:text-[#0091ae] hover:shadow-sm transition-all"
                          >
                            <ListIcon className="h-4 w-4" />
                          </Link>
                          <DeleteButton companyId={company.id} />
                        </div>
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
