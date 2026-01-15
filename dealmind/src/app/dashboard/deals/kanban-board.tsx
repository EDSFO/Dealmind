'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

const DEAL_STAGES = [
  { key: 'LEAD', label: 'Lead', color: 'bg-gray-100 border-gray-200' },
  { key: 'QUALIFICATION', label: 'Qualificação', color: 'bg-blue-50 border-blue-200' },
  { key: 'PROPOSAL', label: 'Proposta', color: 'bg-yellow-50 border-yellow-200' },
  { key: 'NEGOTIATION', label: 'Negociação', color: 'bg-purple-50 border-purple-200' },
  { key: 'CLOSED_WON', label: 'Ganho', color: 'bg-green-50 border-green-200' },
  { key: 'CLOSED_LOST', label: 'Perdido', color: 'bg-red-50 border-red-200' },
] as const

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function formatDate(date: Date | string | null): string {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('pt-BR')
}

interface Deal {
  id: string
  title: string
  value: number
  stage: string
  priority: string
  expectedClose: string | null
  contact: { name: string } | null
  owner: { id: string; name: string } | null
}

interface KanbanBoardProps {
  initialDeals: Deal[]
  users: { id: string; name: string }[]
}

export default function KanbanBoard({ initialDeals, users }: KanbanBoardProps) {
  const [deals] = useState(initialDeals)
  const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null)
  const [draggedOverStage, setDraggedOverStage] = useState<string | null>(null)
  const [filterOwner, setFilterOwner] = useState<string>('all')
  const [filterStage, setFilterStage] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Filter deals based on filters
  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      const matchesOwner = filterOwner === 'all' || deal.owner?.id === filterOwner
      const matchesStage = filterStage === 'all' || deal.stage === filterStage
      const matchesSearch = searchTerm === '' ||
        deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.contact?.name?.toLowerCase().includes(searchTerm.toLowerCase())

      return matchesOwner && matchesStage && matchesSearch
    })
  }, [deals, filterOwner, filterStage, searchTerm])

  const dealsByStage = DEAL_STAGES.reduce((acc, stage) => {
    acc[stage.key] = filteredDeals.filter((deal) => deal.stage === stage.key)
    return acc
  }, {} as Record<string, Deal[]>)

  const handleDragStart = (e: React.DragEvent, deal: Deal) => {
    setDraggedDeal(deal)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', deal.id)
  }

  const handleDragOver = (e: React.DragEvent, stageKey: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDraggedOverStage(stageKey)
  }

  const handleDragLeave = () => {
    setDraggedOverStage(null)
  }

  const handleDrop = async (e: React.DragEvent, stageKey: string) => {
    e.preventDefault()
    setDraggedOverStage(null)

    if (!draggedDeal || draggedDeal.stage === stageKey) {
      setDraggedDeal(null)
      return
    }

    // Optimistic update is handled by parent revalidation
    try {
      await fetch('/api/deals/update-stage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealId: draggedDeal.id, stage: stageKey }),
      })
    } catch (error) {
      console.error('Error updating deal stage:', error)
    }

    setDraggedDeal(null)
  }

  const handleDragEnd = () => {
    setDraggedDeal(null)
    setDraggedOverStage(null)
  }

  const clearFilters = () => {
    setFilterOwner('all')
    setFilterStage('all')
    setSearchTerm('')
  }

  const hasActiveFilters = filterOwner !== 'all' || filterStage !== 'all' || searchTerm !== ''

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4 items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-medium text-gray-500 mb-1 block">Buscar</label>
          <input
            type="text"
            placeholder="Buscar deals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="w-48">
          <label className="text-xs font-medium text-gray-500 mb-1 block">Responsável</label>
          <select
            value={filterOwner}
            onChange={(e) => setFilterOwner(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Todos</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>

        <div className="w-48">
          <label className="text-xs font-medium text-gray-500 mb-1 block">Estágio</label>
          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Todos</option>
            {DEAL_STAGES.map((stage) => (
              <option key={stage.key} value={stage.key}>
                {stage.label}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
          >
            Limpar filtros
          </button>
        )}

        <div className="ml-auto text-sm text-gray-500">
          {filteredDeals.length} / {deals.length} deals
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {DEAL_STAGES.map((stage) => {
          const stageDeals = dealsByStage[stage.key] || []
          const stageValue = stageDeals.reduce((sum, deal) => sum + deal.value, 0)

          return (
            <div
              key={stage.key}
              className={`min-w-[300px] flex-1 rounded-xl border ${stage.color} p-4 transition-colors ${
                draggedOverStage === stage.key ? 'ring-2 ring-blue-400' : ''
              }`}
              onDragOver={(e) => handleDragOver(e, stage.key)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stage.key)}
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">{stage.label}</h3>
                <span className="rounded-full bg-white px-2 py-1 text-xs font-medium text-gray-600">
                  {stageDeals.length}
                </span>
              </div>
              <p className="mb-3 text-sm text-gray-600">{formatCurrency(stageValue)}</p>
              <div className="space-y-3">
                {stageDeals.map((deal) => (
                  <div
                    key={deal.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, deal)}
                    onDragEnd={handleDragEnd}
                    className={`rounded-lg border border-gray-200 bg-white p-3 shadow-sm cursor-move hover:shadow-md transition-shadow ${
                      draggedDeal?.id === deal.id ? 'opacity-50' : ''
                    }`}
                  >
                    <Link href={`/dashboard/deals/${deal.id}`} className="block">
                      <h4 className="font-medium text-gray-900">{deal.title}</h4>
                      <p className="mt-1 text-sm font-semibold text-blue-600">
                        {formatCurrency(deal.value)}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                        {deal.contact && (
                          <span>{deal.contact.name}</span>
                        )}
                        {deal.expectedClose && (
                          <span>{formatDate(deal.expectedClose)}</span>
                        )}
                      </div>
                      {deal.owner && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="h-5 w-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium">
                            {deal.owner.name?.charAt(0) || 'U'}
                          </div>
                          <span className="text-xs text-gray-500">{deal.owner.name}</span>
                        </div>
                      )}
                    </Link>
                  </div>
                ))}
                {stageDeals.length === 0 && (
                  <div className="text-center py-8 text-sm text-gray-400">
                    Sem deals
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
