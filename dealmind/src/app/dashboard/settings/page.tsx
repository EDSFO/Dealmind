'use client'

import { useState } from 'react'
import { api } from '~/trpc/react'
import {
    Building2,
    Users,
    Target,
    PhoneCall,
    Activity,
    Save,
    Loader2,
    Settings as SettingsIcon,
    ShieldAlert,
    ListTodo
} from 'lucide-react'

export default function SettingsPage() {
    const { data: tenant, isLoading, refetch } = api.tenant.getDetails.useQuery()
    const { data: userCurrent } = api.user.me.useQuery() // Needs me query, assuming we have it or we can just assume from role if we had a role hook.

    // Actually, we already check admin on backend, let's just use it.
    const updateTenant = api.tenant.update.useMutation({
        onSuccess: () => {
            refetch()
        }
    })

    // State
    const [name, setName] = useState('')
    const [hasInitialized, setHasInitialized] = useState(false)

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    if (!tenant) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh]">
                <h1 className="text-2xl font-bold text-[#001d3a]">Configurações da Empresa não encontradas</h1>
            </div>
        )
    }

    if (!hasInitialized) {
        setName(tenant.name)
        setHasInitialized(true)
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return

        try {
            await updateTenant.mutateAsync({ name })
            alert('Configurações atualizadas com sucesso!')
        } catch (error: any) {
            alert(error.message || 'Erro ao atualizar configurações')
        }
    }

    const isSaving = updateTenant.isPending

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-[#001d3a] flex items-center gap-3">
                    <SettingsIcon className="h-8 w-8 text-blue-600" />
                    Configurações da Empresa
                </h1>
                <p className="text-gray-500 mt-1">Gerencie os dados globais do seu workspace empresarial.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left column - Form */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-[#001d3a] mb-6 flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-gray-400" />
                            Dados Gerais
                        </h2>

                        <form onSubmit={handleSave} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                    Nome da Empresa / Workspace
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="text"
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="block w-full rounded-md border border-gray-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        placeholder="Nome da sua empresa"
                                        required
                                    />
                                </div>
                                <p className="mt-2 text-xs text-gray-500">
                                    Este é o nome que aparecerá para toda a sua equipe.
                                </p>
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSaving || name.trim() === tenant.name}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" /> Salvando...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" /> Salvar Alterações
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-[#001d3a] flex items-center gap-2">
                                <ListTodo className="h-5 w-5 text-gray-400" />
                                Estágios do Pipeline
                            </h2>
                            <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
                                Gerenciar
                            </button>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            Configure os estágios que formam o funil de vendas da sua empresa. Os estágios definem a jornada que os negócios percorrem até o fechamento.
                        </p>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-center text-sm text-gray-500 italic">
                            Gerenciador de estágios do pipeline (Em breve)
                        </div>
                    </div>
                </div>

                {/* Right column - Usage/Stats */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-bold text-[#001d3a] mb-6 flex items-center gap-2">
                            <Activity className="h-5 w-5 text-gray-400" />
                            Uso do Workspace
                        </h2>

                        <div className="space-y-4">
                            {/* Users */}
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-md">
                                        <Users className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Usuários</p>
                                    </div>
                                </div>
                                <span className="text-lg font-bold text-[#001d3a]">{tenant._count?.users || 0}</span>
                            </div>

                            {/* Contacts */}
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 rounded-md">
                                        <PhoneCall className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Contatos</p>
                                    </div>
                                </div>
                                <span className="text-lg font-bold text-[#001d3a]">{tenant._count?.contacts || 0}</span>
                            </div>

                            {/* Deals */}
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-100 rounded-md">
                                        <Target className="h-4 w-4 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Negócios</p>
                                    </div>
                                </div>
                                <span className="text-lg font-bold text-[#001d3a]">{tenant._count?.deals || 0}</span>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-100 rounded-md">
                                        <Building2 className="h-4 w-4 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Empresas (Leads)</p>
                                    </div>
                                </div>
                                <span className="text-lg font-bold text-[#001d3a]">{tenant._count?.companies || 0}</span>
                            </div>

                        </div>
                    </div>

                    <div className="bg-red-50 rounded-xl shadow-sm border border-red-100 p-6">
                        <h2 className="text-lg font-bold text-red-800 mb-2 flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5 text-red-600" />
                            Zona de Perigo
                        </h2>
                        <p className="text-sm text-red-700 mb-4">
                            Ações aqui não podem ser desfeitas e afetam todos os usuários da empresa.
                        </p>
                        <button
                            className="w-full px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-medium rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                        >
                            Excluir Workspace
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
