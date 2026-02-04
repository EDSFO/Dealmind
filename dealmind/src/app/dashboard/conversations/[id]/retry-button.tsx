'use client'

import { useState } from 'react'
import { retryProcessing } from './actions'
import { RotateCw, CheckCircle2, AlertCircle } from 'lucide-react'

interface RetryButtonProps {
  conversationId: string
  status: string
}

export default function RetryButton({ conversationId, status }: RetryButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null)

  // Só mostrar o botão se o status for FAILED ou PENDING
  if (status !== 'FAILED' && status !== 'PENDING') {
    return null
  }

  const handleRetry = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await retryProcessing(conversationId)
      setResult(response)

      if (response.success) {
        // Recarregar a página após 1 segundo para mostrar o novo status
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      }
    } catch (error) {
      setResult({ error: 'Erro ao reenviar processamento' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mt-4">
      <button
        onClick={handleRetry}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#ff5c35] rounded-md hover:bg-[#e04d2b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
      >
        {isLoading ? (
          <>
            <RotateCw className="h-4 w-4 animate-spin" />
            Reenviando...
          </>
        ) : (
          <>
            <RotateCw className="h-4 w-4" />
            Reenviar para Análise
          </>
        )}
      </button>

      {result?.success && (
        <div className="mt-2 flex items-center gap-2 p-2 bg-green-50 rounded border border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <p className="text-xs text-green-800">Reenviado com sucesso! Atualizando...</p>
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

