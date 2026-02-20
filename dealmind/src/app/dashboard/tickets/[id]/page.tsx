import { createClient } from '~/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { api } from '~/trpc/server'
import { ChevronLeft, Calendar, Tag, User, Building2, Clock, CheckCircle, Flag } from 'lucide-react'

export default async function TicketDetailsPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
        redirect('/login')
    }

    const ticket = await api.ticket.byId({ id: params.id })

    if (!ticket) {
        redirect('/dashboard/tickets')
    }

    return (
        <div className="flex flex-col min-h-[calc(100vh-64px)] overflow-hidden bg-[#f5f8fa]">
            {/* Top Bar */}
            <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/tickets" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-[#001d3a]">{ticket.title}</h1>
                        <p className="text-xs text-gray-500 font-mono mt-0.5">ID: {ticket.id}</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto p-6">
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Left Column - Details */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <h2 className="text-lg font-bold text-[#001d3a] mb-4">Detalhes do Ticket</h2>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-1">Descrição</h3>
                                    <div className="text-sm text-gray-800 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-100">
                                        {ticket.description || 'Nenhuma descrição fornecida.'}
                                    </div>
                                </div>

                                {ticket.resolution && (
                                    <div>
                                        <h3 className="text-xs font-semibold text-green-600 uppercase mb-1 flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" /> Resolução
                                        </h3>
                                        <div className="text-sm text-gray-800 whitespace-pre-wrap bg-green-50 p-4 rounded-lg border border-green-100">
                                            {ticket.resolution}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Meta Info */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <h2 className="text-sm font-bold text-[#001d3a] mb-4 uppercase tracking-wide">Informações</h2>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500 flex items-center gap-2">
                                        <Flag className="w-4 h-4" /> Status
                                    </span>
                                    <span className="text-xs font-semibold bg-gray-100 px-2 py-1 rounded-md">{ticket.status}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500 flex items-center gap-2">
                                        <Tag className="w-4 h-4" /> Prioridade
                                    </span>
                                    <span className="text-xs font-semibold bg-gray-100 px-2 py-1 rounded-md">{ticket.priority}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" /> Criado em
                                    </span>
                                    <span className="text-xs font-medium text-gray-700">
                                        {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-100 space-y-4">
                                {ticket.company && (
                                    <div>
                                        <span className="text-xs text-gray-500 block mb-1 flex items-center gap-1">
                                            <Building2 className="w-3 h-3" /> Empresa Relacionada
                                        </span>
                                        <Link href={`/dashboard/companies/${ticket.company.id}`} className="text-sm font-semibold text-blue-600 hover:underline">
                                            {ticket.company.name}
                                        </Link>
                                    </div>
                                )}

                                {ticket.contact && (
                                    <div>
                                        <span className="text-xs text-gray-500 block mb-1 flex items-center gap-1">
                                            <User className="w-3 h-3" /> Contato Relacionado
                                        </span>
                                        <span className="text-sm font-semibold text-gray-800">
                                            {ticket.contact.name || ticket.contact.email}
                                        </span>
                                    </div>
                                )}

                                <div>
                                    <span className="text-xs text-gray-500 block mb-1 flex items-center gap-1">
                                        <User className="w-3 h-3" /> Responsável
                                    </span>
                                    <span className="text-sm font-semibold text-gray-800">
                                        {ticket.owner?.name || 'Não atribuído'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
