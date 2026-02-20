import { createClient } from '~/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { api } from '~/trpc/server'
import { DeleteButton } from './delete-button'
import { ChevronDown, Plus, List as ListIcon, LifeBuoy, Building2, User } from 'lucide-react'

function getStatusBadge(status: string) {
    const variants: any = {
        OPEN: "bg-yellow-100 text-yellow-800",
        IN_PROGRESS: "bg-blue-100 text-blue-800",
        WAITING_CUSTOMER: "bg-purple-100 text-purple-800",
        RESOLVED: "bg-green-100 text-green-800",
        CLOSED: "bg-gray-100 text-gray-800",
        CANCELLED: "bg-red-100 text-red-800"
    };

    const labels: any = {
        OPEN: "Aberto",
        IN_PROGRESS: "Em andamento",
        WAITING_CUSTOMER: "Aguardando",
        RESOLVED: "Resolvido",
        CLOSED: "Fechado",
        CANCELLED: "Cancelado"
    };

    return <span className={`px-2 py-1 text-[10px] font-semibold rounded-md ${variants[status] || variants.OPEN}`}>{labels[status] || status}</span>;
}

function getPriorityBadge(priority: string) {
    const variants: any = {
        LOW: "bg-gray-100 text-gray-700",
        MEDIUM: "bg-blue-100 text-blue-700",
        HIGH: "bg-orange-100 text-orange-700",
        URGENT: "bg-red-100 text-red-700"
    };

    const labels: any = {
        LOW: "Baixa",
        MEDIUM: "Média",
        HIGH: "Alta",
        URGENT: "Urgente"
    };

    return <span className={`px-2 py-1 text-[10px] font-semibold rounded-md ${variants[priority] || variants.LOW}`}>{labels[priority] || priority}</span>;
}

export default async function TicketsPage() {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
        redirect('/login')
    }

    // Buscar tickets e estatísticas via tRPC
    const tickets = await api.ticket.list()
    const stats = await api.ticket.stats() || { total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0 };

    return (
        <div className="flex flex-col min-h-[calc(100vh-64px)] overflow-hidden">
            {/* Top Title Bar */}
            <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-[#001d3a] flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 -ml-2 rounded transition-colors group">
                        Tickets de Suporte
                        <ChevronDown className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                        Ações <ChevronDown className="h-4 w-4" />
                    </button>
                    <Link
                        href="/dashboard/tickets/new"
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#ff5c35] rounded-md hover:bg-[#e04d2b] transition-colors shadow-sm"
                    >
                        Abrir ticket
                    </Link>
                </div>
            </div>

            {/* Tabs Bar */}
            <div className="bg-white border-b px-6 flex items-center justify-between h-12 min-h-[48px]">
                <div className="flex items-center gap-6 h-full">
                    <button className="text-sm font-semibold text-[#001d3a] border-b-2 border-orange-500 h-full flex items-center">
                        Todos os tickets
                    </button>
                    <button className="text-sm font-medium text-gray-500 hover:text-gray-700 h-full flex items-center">
                        Meus tickets
                    </button>
                    <button className="text-sm font-medium text-blue-600 hover:text-blue-700 h-full flex items-center gap-1">
                        <Plus className="h-4 w-4" /> Adicionar visualização
                    </button>
                </div>
            </div>

            {/* Metrics Summary Bar */}
            <div className="bg-white border-b px-6 py-6 overflow-x-auto">
                <div className="flex items-center justify-between min-w-max gap-8 px-4">
                    <div className="text-center flex-1">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1">TOTAL DE TICKETS</p>
                        <h3 className="text-2xl font-bold text-[#001d3a]">{stats.total}</h3>
                    </div>
                    <div className="w-px h-12 bg-gray-200" />
                    <div className="text-center flex-1">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-yellow-600 mb-1">EM ABERTO</p>
                        <h3 className="text-2xl font-bold text-yellow-600">{stats.open}</h3>
                    </div>
                    <div className="w-px h-12 bg-gray-200" />
                    <div className="text-center flex-1">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-blue-600 mb-1">EM ANDAMENTO</p>
                        <h3 className="text-2xl font-bold text-blue-600">{stats.inProgress}</h3>
                    </div>
                    <div className="w-px h-12 bg-gray-200" />
                    <div className="text-center flex-1">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-green-600 mb-1">RESOLVIDOS</p>
                        <h3 className="text-2xl font-bold text-green-600">{stats.resolved}</h3>
                    </div>
                </div>
            </div>

            {/* List Container */}
            <div className="flex-1 bg-[#f5f8fa] p-6 overflow-auto">
                {tickets.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50">
                            <LifeBuoy className="h-10 w-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-[#001d3a]">Nenhum ticket encontrado</h3>
                        <p className="mt-2 text-gray-500 max-w-sm">Crie seu primeiro ticket para acompanhar chamados e suporte de seus clientes.</p>
                        <Link
                            href="/dashboard/tickets/new"
                            className="mt-6 px-6 py-3 rounded-md bg-[#ff5c35] text-white font-semibold hover:bg-[#e04d2b] transition-all"
                        >
                            Abrir primeiro ticket
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Assunto</th>
                                        <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Prioridade</th>
                                        <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Empresa/Contato</th>
                                        <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Data de Criação</th>
                                        <th className="px-6 py-4 text-right text-[11px] font-bold text-gray-500 uppercase tracking-wider">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {tickets.map((ticket: any) => (
                                        <tr key={ticket.id} className="hover:bg-blue-50/30 transition-colors group cursor-pointer">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <p className="text-sm font-bold text-[#0091ae] group-hover:underline line-clamp-1">{ticket.title}</p>
                                                    <p className="text-[10px] text-gray-400 font-mono tracking-tighter">ID: {ticket.id.slice(0, 8)}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(ticket.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getPriorityBadge(ticket.priority)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    {ticket.company && (
                                                        <span className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                                                            <Building2 className="w-3 h-3 text-gray-400" />
                                                            {ticket.company.name}
                                                        </span>
                                                    )}
                                                    {!ticket.company && ticket.contact && (
                                                        <span className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                                                            <User className="w-3 h-3 text-gray-400" />
                                                            {ticket.contact.name || ticket.contact.email}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/dashboard/tickets/${ticket.id}`}
                                                        className="rounded-lg p-2 text-gray-400 hover:bg-white hover:text-[#0091ae] hover:shadow-sm transition-all"
                                                    >
                                                        <ListIcon className="h-4 w-4" />
                                                    </Link>
                                                    <DeleteButton ticketId={ticket.id} />
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
