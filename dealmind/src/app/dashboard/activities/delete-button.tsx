'use client'

import { useState } from 'react'
import { api } from '~/trpc/react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

interface DeleteButtonProps {
    activityId: string
}

export function DeleteButton({ activityId }: DeleteButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const router = useRouter()
    const deleteActivity = api.activity.delete.useMutation()

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        e.stopPropagation()

        if (!confirm('Tem certeza que deseja excluir esta atividade?')) {
            return
        }
        setIsDeleting(true)
        deleteActivity.mutate(
            { id: activityId },
            {
                onSuccess: () => {
                    router.refresh()
                },
                onError: () => {
                    setIsDeleting(false)
                    alert('Erro ao excluir a atividade')
                }
            }
        )
    }

    return (
        <button
            type="button"
            className="rounded-lg p-2 text-gray-300 hover:bg-red-100 hover:text-red-500 transition-colors focus:outline-none"
            onClick={handleClick}
            disabled={isDeleting}
            title="Excluir Atividade"
        >
            <Trash2 className="w-4 h-4" />
        </button>
    )
}
