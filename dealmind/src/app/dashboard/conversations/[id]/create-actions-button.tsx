'use client'

import { useState } from 'react'
import { createActionsFromInsights } from './actions'
import { CheckCircle2, AlertCircle, Sparkles } from 'lucide-react'

interface CreateActionsButtonProps {
    conversationId: string
    hasDeal: boolean
    hasNextActions: boolean
}

export default function CreateActionsButton({ conversationId, hasDeal, hasNextActions }: CreateActionsButtonProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState<{ success?: boolean; error?: string; created?: number } | null>(null)

    if (!hasDeal || !hasNextActions) {
        return null
    }

    const handleCreate = async () => {
        setIsLoading(true)
        setResult(null)

        try {
            const response = await createActionsFromInsights(conversationId)
            setResult(response)

            if (response.success) {
                setTimeout(() => {
                    window.location.reload()
                }, 1500)
            }
        } catch (error) {
            setResult({ error: 'Erro ao criar atividades' })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="mt-4">
            <button
                onClick={handleCreate}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
                {isLoading ? (
                    <>
                        <Sparkles className="h-4 w-4 animate-spin text-blue-200" />
                        Criando Tarefas...
                    </>
                ) : (
                    <>
                        <Sparkles className="h-4 w-4" />
                        Sincronizar Tarefas com Negócio
                    </>
                )}
            </button>

            {result?.success && (
                <div className="mt-2 flex items-center gap-2 p-2 bg-green-50 rounded border border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <p className="text-xs text-green-800">{result.created} tarefas criadas com sucesso!</p>
                </div>
            )}

            {result?.error && (
                <div className="mt-2 flex items-center gap-2 p-2 bg-red-50 rounded border border-red-200">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <p className="text-xs text-red-800">{result.error}</p>
                </div>
            )}
        </div>
    )
}
