'use client'

import { useState } from 'react'
import { createActivity, completeActivity } from './activity-actions'
import {
  Phone,
  Mail,
  Users,
  CheckSquare,
  FileText,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronDown
} from 'lucide-react'
import { cn } from '~/lib/utils'

const ACTIVITY_TYPES = [
  { value: 'call', label: 'Ligação', icon: Phone, color: 'text-blue-600', bg: 'bg-blue-50' },
  { value: 'email', label: 'Email', icon: Mail, color: 'text-orange-600', bg: 'bg-orange-50' },
  { value: 'meeting', label: 'Reunião', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
  { value: 'task', label: 'Tarefa', icon: CheckSquare, color: 'text-green-600', bg: 'bg-green-50' },
  { value: 'note', label: 'Nota', icon: FileText, color: 'text-gray-600', bg: 'bg-gray-50' },
]

function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
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
  const completedActivities = activities.filter(a => a.status === 'COMPLETED')

  const handleComplete = async (activityId: string) => {
    await completeActivity(activityId)
    window.location.reload()
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-6">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <h2 className="text-sm font-bold text-[#001d3a] flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-500" /> Próximas Atividades
          {pendingActivities.length > 0 && (
            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[10px] ml-1">
              {pendingActivities.length}
            </span>
          )}
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 uppercase tracking-tight"
        >
          <Plus className="h-3.5 w-3.5" />
          {showForm ? 'Cancelar' : 'Agendar'}
        </button>
      </div>

      {/* Add Activity Form */}
      {showForm && (
        <div className="p-6 bg-white border-b animate-in fade-in slide-in-from-top-2 duration-200">
          <form action={createActivity} className="space-y-4">
            <input type="hidden" name="dealId" value={dealId} />
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Tipo de Atividade</label>
                <div className="relative">
                  <select
                    name="type"
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
                  >
                    {ACTIVITY_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Vencimento</label>
                <input
                  type="date"
                  name="dueAt"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Título</label>
              <input
                type="text"
                name="title"
                required
                placeholder="Ex: Definir orçamento com decisor"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Notas / Descrição</label>
              <textarea
                name="description"
                rows={3}
                placeholder="Descreva os pontos principais..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-[#ff5c35] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#e04d2b] shadow-sm transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Salvando...' : 'Agendar Atividade'}
            </button>
          </form>
        </div>
      )}

      <div className="divide-y divide-gray-100">
        {pendingActivities.map((activity) => (
          <ActivityItem
            key={activity.id}
            activity={activity}
            currentUserId={currentUserId}
            onComplete={handleComplete}
          />
        ))}

        {completedActivities.length > 0 && (
          <div className="bg-gray-50/50 px-6 py-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Concluídas recentemente</p>
          </div>
        )}

        {completedActivities.slice(0, 5).map((activity) => (
          <ActivityItem
            key={activity.id}
            activity={activity}
            currentUserId={currentUserId}
            onComplete={handleComplete}
          />
        ))}
      </div>

      {activities.length === 0 && !showForm && (
        <div className="p-12 text-center">
          <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckSquare className="h-8 w-8 text-gray-300" />
          </div>
          <h3 className="text-sm font-bold text-[#001d3a]">Nada agendado</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-[200px] mx-auto">
            Mantenha o negócio em movimento agendando o próximo passo.
          </p>
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
  const isCompleted = activity.status === 'COMPLETED'

  return (
    <div className={cn(
      "flex items-start gap-4 px-6 py-4 transition-colors group",
      isCompleted ? "opacity-60 bg-white" : "hover:bg-blue-50/30"
    )}>
      <div className={cn(
        "h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 border",
        isCompleted ? "bg-gray-100 border-gray-200" : `${typeInfo.bg} ${typeInfo.color.replace('text-', 'border-').replace('600', '200')}`
      )}>
        <typeInfo.icon className={cn("h-4 w-4", isCompleted ? "text-gray-400" : typeInfo.color)} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className={cn(
            "text-sm font-bold truncate transition-all",
            isCompleted ? "text-gray-500 line-through" : "text-[#001d3a]"
          )}>
            {activity.title}
          </p>
          {!isCompleted && isOwner && (
            <button
              onClick={() => onComplete(activity.id)}
              className="h-7 w-7 rounded-md border border-green-200 text-green-600 hover:bg-green-50 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
              title="Marcar como concluída"
            >
              <CheckCircle2 className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
            <User className="h-3 w-3" size={12} />
            {activity.user?.name || 'Sistema'}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
            <Clock className="h-3 w-3" size={12} />
            {formatDateTime(activity.createdAt)}
          </div>
          {activity.dueAt && !isCompleted && (
            <div className={cn(
              "flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded",
              isOverdue ? "text-red-600 bg-red-50" : "text-blue-600 bg-blue-50"
            )}>
              {isOverdue ? <AlertCircle className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}
              Vence em: {formatDate(activity.dueAt)}
            </div>
          )}
        </div>

        {activity.description && (
          <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-xs text-gray-600 leading-relaxed italic">{activity.description}</p>
          </div>
        )}
      </div>
    </div>
  )
}
