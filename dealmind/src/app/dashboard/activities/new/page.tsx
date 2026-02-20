'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '~/trpc/react'

export default function NewActivityPage() {
    const router = useRouter()
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [type, setType] = useState('CALL')
    const [dueAt, setDueAt] = useState('')
    const [dealId, setDealId] = useState('')

    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    // Buscar Deals para associar a atividade
    const { data: deals } = api.deal.list.useQuery({
        pipelineStageId: undefined,
        ownerId: undefined
    });

    const createActivity = api.activity.create.useMutation({
        onSuccess: () => {
            router.push('/dashboard/activities')
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
            setError('O título deve ter pelo menos 3 caracteres')
            return
        }

        setLoading(true)
        createActivity.mutate({
            title,
            description,
            type,
            dueAt: dueAt ? new Date(dueAt) : undefined,
            dealId: dealId || undefined
        })
    }

    return (
        <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#001d3a]">Nova Atividade</h1>
                    <p className="text-sm text-gray-500">Adicione uma tarefa, lembrete ou reunião.</p>
                </div>
                <Link
                    href="/dashboard/activities"
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
                                    Título da Tarefa *
                                </label>
                                <div className="relative mt-1">
                                    <input
                                        id="title"
                                        type="text"
                                        required
                                        placeholder="Ex: Ligar para confirmar proposta"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="block w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-[#ff5c35] focus:outline-none focus:ring-1 focus:ring-[#ff5c35]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="type" className="block text-sm font-semibold text-gray-700">
                                        Tipo / Categoria
                                    </label>
                                    <select
                                        id="type"
                                        value={type}
                                        onChange={(e) => setType(e.target.value)}
                                        className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-[#ff5c35] focus:outline-none focus:ring-1 focus:ring-[#ff5c35]"
                                    >
                                        <option value="CALL">Ligação</option>
                                        <option value="MEETING">Reunião</option>
                                        <option value="EMAIL">E-mail</option>
                                        <option value="FOLLOW_UP">Follow-up</option>
                                        <option value="REVIEW">Revisão Ténica</option>
                                        <option value="NOTE">Lembrete</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="dueAt" className="block text-sm font-semibold text-gray-700">
                                        Vencimento (Prazo)
                                    </label>
                                    <div className="relative mt-1">
                                        <input
                                            id="dueAt"
                                            type="datetime-local"
                                            value={dueAt}
                                            onChange={(e) => setDueAt(e.target.value)}
                                            className="block w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-[#ff5c35] focus:outline-none focus:ring-1 focus:ring-[#ff5c35]"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="dealId" className="block text-sm font-semibold text-gray-700">
                                    Negócio Associado (Opcional)
                                </label>
                                <select
                                    id="dealId"
                                    value={dealId}
                                    onChange={(e) => setDealId(e.target.value)}
                                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-[#ff5c35] focus:outline-none focus:ring-1 focus:ring-[#ff5c35]"
                                >
                                    <option value="">-- Selecione o Negócio --</option>
                                    {deals?.map((deal: any) => (
                                        <option key={deal.id} value={deal.id}>{deal.title}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-semibold text-gray-700">
                                    Anotações / Notas / Links
                                </label>
                                <div className="relative mt-1">
                                    <textarea
                                        id="description"
                                        rows={4}
                                        placeholder="Adicione escopo para a reunião, link do meet ou anotações..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="block w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-[#ff5c35] focus:outline-none focus:ring-1 focus:ring-[#ff5c35]"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-100">
                                <Link
                                    href="/dashboard/activities"
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
                                        'Salvar Tarefa'
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
