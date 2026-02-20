'use client'

import { useState } from 'react'
import { api } from '~/trpc/react'
import { useRouter } from 'next/navigation'
import { Check, Loader2 } from 'lucide-react'

interface CheckboxButtonProps {
    activityId: string
    initialStatus: string
}

export function CheckboxButton({ activityId, initialStatus }: CheckboxButtonProps) {
    const [status, setStatus] = useState(initialStatus)
    const [isUpdating, setIsUpdating] = useState(false)
    const router = useRouter()

    const completeActivity = api.activity.complete.useMutation()

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        e.stopPropagation()

        if (status === 'COMPLETED') return;

        setIsUpdating(true)
        completeActivity.mutate(
            { id: activityId },
            {
                onSuccess: () => {
                    setStatus('COMPLETED')
                    setIsUpdating(false)
                    router.refresh()
                },
                onError: () => {
                    setIsUpdating(false)
                    alert('Erro ao completar a tarefa')
                }
            }
        )
    }

    if (isUpdating) {
        return (
            <div className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center p-0.5">
                <Loader2 className="w-3 h-3 text-gray-400 animate-spin" />
            </div>
        )
    }

    if (status === 'COMPLETED') {
        return (
            <div className="w-5 h-5 rounded-full bg-green-500 border border-green-500 flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
            </div>
        )
    }

    return (
        <button
            type="button"
            className="w-5 h-5 rounded-full border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 focus:outline-none transition-colors"
            onClick={handleClick}
            disabled={isUpdating || status === 'COMPLETED'}
        >
        </button>
    )
}
