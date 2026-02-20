'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '~/trpc/react'

export default function NewTicketPage() {
    const router = useRouter()
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [type, setType] = useState<'SUPPORT' | 'BILLING' | 'TECHNICAL' | 'FEATURE_REQUEST' | 'BUG_REPORT' | 'QUESTION' | 'OTHER'>('SUPPORT')
    const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM')

    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const createTicket = api.ticket.create.useMutation({
        onSuccess: () => {
            router.push('/dashboard/tickets')
            router.refresh()
        },
        onError: (err) => {
            setError(err.message)
            setLoading(false)
        },
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (title.length < 3) {
            setError('O assunto deve ter pelo menos 3 caracteres')
            return
        }

        setLoading(true)
        createTicket.mutate({
            title,
            description,
            type,
            priority
        })
    }

    return (
        <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#001d3a]">Abrir novo Ticket</h1>
                    <p className="text-sm text-gray-500">Preencha as informações do chamado de suporte.</p>
                </div>
                <Link
                    href="/dashboard/tickets"
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
                >
                    Voltar
                </Link>
            </div>

            <main className="">
                <div className="mx-auto max-w-2xl">
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                                    <div className="flex items-center gap-2">
                                        <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-sm text-red-700">{error}</p>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label htmlFor="title" className="block text-sm font-semibold text-gray-700">
                                    Assunto do Ticket *
                                </label>
                                <div className="relative mt-1">
                                    <input
                                        id="title"
                                        type="text"
                                        required
                                        placeholder="Ex: Problema de acesso ao sistema"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="block w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-[#ff5c35] focus:outline-none focus:ring-1 focus:ring-[#ff5c35]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="type" className="block text-sm font-semibold text-gray-700">
                                    Categoria
                                </label>
                                <select
                                    id="type"
                                    value={type}
                                    onChange={(e) => setType(e.target.value as any)}
                                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-[#ff5c35] focus:outline-none focus:ring-1 focus:ring-[#ff5c35]"
                                >
                                    <option value="SUPPORT">Suporte Geral</option>
                                    <option value="TECHNICAL">Técnico</option>
                                    <option value="BILLING">Faturamento/Financeiro</option>
                                    <option value="BUG_REPORT">Relatório de Bug</option>
                                    <option value="FEATURE_REQUEST">Sugestão de Melhoria</option>
                                    <option value="QUESTION">Dúvida</option>
                                    <option value="OTHER">Outros</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="priority" className="block text-sm font-semibold text-gray-700">
                                    Prioridade
                                </label>
                                <select
                                    id="priority"
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value as any)}
                                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-[#ff5c35] focus:outline-none focus:ring-1 focus:ring-[#ff5c35]"
                                >
                                    <option value="LOW">Baixa</option>
                                    <option value="MEDIUM">Média</option>
                                    <option value="HIGH">Alta</option>
                                    <option value="URGENT">Urgente</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-semibold text-gray-700">
                                    Descrição / Mensagem
                                </label>
                                <div className="relative mt-1">
                                    <textarea
                                        id="description"
                                        rows={5}
                                        placeholder="Descreva detalhadamente a situação..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="block w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-[#ff5c35] focus:outline-none focus:ring-1 focus:ring-[#ff5c35]"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-100">
                                <Link
                                    href="/dashboard/tickets"
                                    className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-center font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </Link>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 rounded-lg bg-[#ff5c35] px-4 py-2.5 font-semibold text-white shadow-sm hover:bg-[#e04d2b] focus:outline-none focus:ring-2 focus:ring-[#ff5c35] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Salvando...
                                        </span>
                                    ) : (
                                        'Abrir Ticket'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    )
}
