'use client'

import { useState } from 'react'
import { createActivity, completeActivity } from './activity-actions'

const ACTIVITY_TYPES = [
  { value: 'call', label: 'Ligação', icon: '📞' },
  { value: 'email', label: 'Email', icon: '✉️' },
  { value: 'meeting', label: 'Reunião', icon: '👥' },
  { value: 'task', label: 'Tarefa', icon: '✅' },
  { value: 'note', label: 'Nota', icon: '📝' },
]

function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDate(date: Date | string | null): string {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  })
}

interface Activity {
  id: string
  type: string
  title: string
  description: string | null
  status: string
  dueAt: string | null
  completedAt: string | null
  createdAt: string
  user: { id: string; name: string } | null
}

interface ActivityListProps {
  dealId: string
  activities: Activity[]
  currentUserId: string
}

export default function ActivityList({ dealId, activities, currentUserId }: ActivityListProps) {
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const pendingActivities = activities.filter(a => a.status === 'PENDING')
  const inProgressActivities = activities.filter(a => a.status === 'IN_PROGRESS')
  const completedActivities = activities.filter(a => a.status === 'COMPLETED')

  const handleComplete = async (activityId: string) => {
    await completeActivity(activityId)
    // In a real app, you'd trigger a revalidation here
    window.location.reload()
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Atividades</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {showForm ? 'Cancelar' : '+ Adicionar'}
        </button>
      </div>

      {/* Add Activity Form */}
      {showForm && (
        <div className="p-6 bg-gray-50 border-b">
          <form action={createActivity} className="space-y-4">
            <input type="hidden" name="dealId" value={dealId} />
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  name="type"
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                >
                  {ACTIVITY_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Vencimento</label>
                <input
                  type="date"
                  name="dueAt"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
              <input
                type="text"
                name="title"
                required
                placeholder="Ex: Ligar para o cliente"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea
                name="description"
                rows={2}
                placeholder="Detalhes da atividade..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Salvando...' : 'Criar Atividade'}
            </button>
          </form>
        </div>
      )}

      {/* Pending Activities */}
      {pendingActivities.length > 0 && (
        <div className="p-4 border-b">
          <h3 className="text-xs font-medium text-gray-500 uppercase mb-3">Pendentes</h3>
          <div className="space-y-2">
            {pendingActivities.map((activity) => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                currentUserId={currentUserId}
                onComplete={handleComplete}
              />
            ))}
          </div>
        </div>
      )}

      {/* In Progress Activities */}
      {inProgressActivities.length > 0 && (
        <div className="p-4 border-b">
          <h3 className="text-xs font-medium text-blue-600 uppercase mb-3">Em Andamento</h3>
          <div className="space-y-2">
            {inProgressActivities.map((activity) => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                currentUserId={currentUserId}
                onComplete={handleComplete}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed Activities */}
      {completedActivities.length > 0 && (
        <div className="p-4">
          <h3 className="text-xs font-medium text-green-600 uppercase mb-3">Concluídas</h3>
          <div className="space-y-2">
            {completedActivities.map((activity) => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                currentUserId={currentUserId}
                onComplete={handleComplete}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {activities.length === 0 && !showForm && (
        <div className="p-8 text-center">
          <div className="text-4xl mb-2">📋</div>
          <p className="text-sm text-gray-500">Nenhuma atividade ainda.</p>
          <p className="text-xs text-gray-400 mt-1">Adicione tarefas, ligacões ou reuniões.</p>
        </div>
      )}
    </div>
  )
}

function ActivityItem({
  activity,
  currentUserId,
  onComplete,
}: {
  activity: Activity
  currentUserId: string
  onComplete: (id: string) => void
}) {
  const typeInfo = ACTIVITY_TYPES.find(t => t.value === activity.type) || ACTIVITY_TYPES[4]
  const isOwner = activity.user?.id === currentUserId
  const isOverdue = activity.dueAt && new Date(activity.dueAt) < new Date() && activity.status !== 'COMPLETED'

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg ${
      activity.status === 'COMPLETED' ? 'bg-gray-50' : 'bg-white border border-gray-200'
    }`}>
      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm ${
        activity.status === 'COMPLETED' ? 'bg-gray-200' : 'bg-blue-100'
      }`}>
        {typeInfo.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={`font-medium text-sm ${
            activity.status === 'COMPLETED' ? 'text-gray-500 line-through' : 'text-gray-900'
          }`}>
            {activity.title}
          </p>
          {isOverdue && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
              Atrasado
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
          <span>{activity.user?.name || 'Sistema'}</span>
          <span>•</span>
          <span>{formatDateTime(activity.createdAt)}</span>
          {activity.dueAt && activity.status !== 'COMPLETED' && (
            <>
              <span>•</span>
              <span className={isOverdue ? 'text-red-600' : ''}>
                Vence: {formatDate(activity.dueAt)}
              </span>
            </>
          )}
        </div>
        {activity.description && (
          <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
        )}
      </div>
      {activity.status !== 'COMPLETED' && isOwner && (
        <button
          onClick={() => onComplete(activity.id)}
          className="text-green-600 hover:text-green-700 p-1"
          title="Marcar como concluída"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </button>
      )}
    </div>
  )
}
