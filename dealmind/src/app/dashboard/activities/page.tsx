import { createClient } from '~/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { api } from '~/trpc/server'
import { ChevronDown, Plus, LayoutDashboard, CheckCircle, Clock } from 'lucide-react'
import { CheckboxButton } from './checkbox-button'
import { DeleteButton } from './delete-button'

function getStatusBadge(status: string) {
    const variants: any = {
        PENDING: "bg-yellow-100 text-yellow-800",
        IN_PROGRESS: "bg-blue-100 text-blue-800",
        COMPLETED: "bg-green-100 text-green-800",
        CANCELLED: "bg-red-100 text-red-800",
    };

    const labels: any = {
        PENDING: "Pendente",
        IN_PROGRESS: "Em andamento",
        COMPLETED: "Concluído",
        CANCELLED: "Cancelado",
    };

    return <span className={`px-2 py-1 text-[10px] font-semibold rounded-md ${variants[status] || variants.PENDING}`}>{labels[status] || status}</span>;
}

export default async function ActivitiesPage() {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
        redirect('/login')
    }

    // Buscar atividades via tRPC
    const activities = await api.activity.list()
    const stats = await api.activity.stats() || { total: 0, pending: 0, inProgress: 0, completed: 0, overdue: 0 };

    return (
        <div className="flex flex-col min-h-[calc(100vh-64px)] overflow-hidden">
            {/* Top Title Bar */}
            <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-[#001d3a] flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 -ml-2 rounded transition-colors group">
                        Atividades Diárias
                        <ChevronDown className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        href="/dashboard/activities/new"
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#ff5c35] rounded-md hover:bg-[#e04d2b] transition-colors shadow-sm"
                    >
                        Nova atividade
                    </Link>
                </div>
            </div>

            {/* Tabs Bar */}
            <div className="bg-white border-b px-6 flex items-center justify-between h-12 min-h-[48px]">
                <div className="flex items-center gap-6 h-full">
                    <button className="text-sm font-semibold text-[#001d3a] border-b-2 border-orange-500 h-full flex items-center">
                        Lista
                    </button>
                    <button className="text-sm font-medium text-gray-500 hover:text-gray-700 h-full flex items-center">
                        Calendário
                    </button>
                </div>
            </div>

            {/* Metrics Summary Bar */}
            <div className="bg-white border-b px-6 py-6 overflow-x-auto">
                <div className="flex items-center justify-between min-w-max gap-8 px-4">
                    <div className="text-center flex-1">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1">TOTAL</p>
                        <h3 className="text-2xl font-bold text-[#001d3a]">{stats.total}</h3>
                    </div>
                    <div className="w-px h-12 bg-gray-200" />
                    <div className="text-center flex-1">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-red-600 mb-1">ATRASADAS</p>
                        <h3 className="text-2xl font-bold text-red-600">{stats.overdue}</h3>
                    </div>
                    <div className="w-px h-12 bg-gray-200" />
                    <div className="text-center flex-1">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-yellow-600 mb-1">PENDENTES</p>
                        <h3 className="text-2xl font-bold text-yellow-600">{stats.pending + stats.inProgress}</h3>
                    </div>
                    <div className="w-px h-12 bg-gray-200" />
                    <div className="text-center flex-1">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-green-600 mb-1">CONCLUÍDAS</p>
                        <h3 className="text-2xl font-bold text-green-600">{stats.completed}</h3>
                    </div>
                </div>
            </div>

            {/* List Container */}
            <div className="flex-1 bg-[#f5f8fa] p-6 overflow-auto">
                {activities.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50">
                            <CheckCircle className="h-10 w-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-[#001d3a]">Tudo limpo!</h3>
                        <p className="mt-2 text-gray-500 max-w-sm">Você não tem atividades cadastradas. Crie tarefas, lembretes de ligação e reuniões para organizar seu dia.</p>
                        <Link
                            href="/dashboard/activities/new"
                            className="mt-6 px-6 py-3 rounded-md bg-[#ff5c35] text-white font-semibold hover:bg-[#e04d2b] transition-all"
                        >
                            Criar primeira atividade
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden max-w-5xl mx-auto">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-10">OK</th>
                                        <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Título da Tarefa</th>
                                        <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Negócio (Deal)</th>
                                        <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Prazo</th>
                                        <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-right text-[11px] font-bold text-gray-500 uppercase tracking-wider">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {activities.map((activity: any) => (
                                        <tr key={activity.id} className={`hover:bg-blue-50/30 transition-colors group ${activity.status === 'COMPLETED' ? 'opacity-60 bg-gray-50' : ''}`}>
                                            <td className="px-6 py-4 whitespace-nowrap pt-5">
                                                <CheckboxButton activityId={activity.id} initialStatus={activity.status} />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <p className={`text-sm font-bold ${activity.status === 'COMPLETED' ? 'text-gray-500 line-through' : 'text-[#001d3a]'} line-clamp-1`}>
                                                        {activity.title}
                                                    </p>
                                                    <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                                                        <span className="font-semibold text-gray-400">{activity.type}</span>
                                                        {activity.description && <span className="text-gray-400"> • {activity.description.substring(0, 30)}...</span>}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {activity.deal ? (
                                                    <Link href={`/dashboard/deals/${activity.deal.id}`} className="text-xs font-semibold text-blue-600 hover:underline">
                                                        {activity.deal.title}
                                                    </Link>
                                                ) : (
                                                    <span className="text-xs text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {activity.dueAt ? (
                                                    <div className="flex items-center gap-1.5 ">
                                                        <Clock className={`h-3 w-3 ${new Date(activity.dueAt) < new Date() && activity.status !== 'COMPLETED' ? 'text-red-500' : 'text-gray-400'}`} />
                                                        <span className={`text-xs ${new Date(activity.dueAt) < new Date() && activity.status !== 'COMPLETED' ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
                                                            {new Date(activity.dueAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(activity.status)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <DeleteButton activityId={activity.id} />
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
