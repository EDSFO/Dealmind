'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  ChevronRight,
  ChevronLeft,
  MessageSquare,
  CheckSquare,
  Plus,
  MoreHorizontal,
  Calendar,
  User,
  ExternalLink,
  Edit2,
  Trash2
} from 'lucide-react'
import { cn } from '~/lib/utils'

const DEAL_STAGES = [
  { key: 'LEAD', label: 'Oportunidade de negócio', color: 'bg-white' },
  { key: 'QUALIFICATION', label: 'Em diagnóstico', color: 'bg-white' },
  { key: 'PROPOSAL', label: 'Elaboração de Proposta', color: 'bg-white' },
  { key: 'NEGOTIATION', label: 'Em negociação', color: 'bg-white' },
  { key: 'CONTRACTING', label: 'Contratação', color: 'bg-white' },
  { key: 'CLOSED_WON', label: 'Negócio fechado', color: 'bg-white' },
  { key: 'CLOSED_LOST', label: 'Negócio perdido', color: 'bg-white' },
] as const

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
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
  createdAt?: string
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

  const dealsByStage = useMemo(() => {
    return DEAL_STAGES.reduce((acc, stage) => {
      acc[stage.key] = deals.filter((deal) => deal.stage === stage.key)
      return acc
    }, {} as Record<string, Deal[]>)
  }, [deals])

  const handleDragStart = (e: React.DragEvent, deal: Deal) => {
    setDraggedDeal(deal)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', deal.id)
  }

  const handleDragOver = (e: React.DragEvent, stageKey: string) => {
    e.preventDefault()
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

    try {
      await fetch('/api/deals/update-stage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealId: draggedDeal.id, stage: stageKey }),
      })
      // Note: In a real app, we'd trigger a router.refresh() or use tRPC mutation
    } catch (error) {
      console.error('Error updating deal stage:', error)
    }

    setDraggedDeal(null)
  }

  return (
    <div className="flex gap-4 min-h-full pb-8 overflow-x-auto select-none">
      {DEAL_STAGES.map((stage) => {
        const stageDeals = dealsByStage[stage.key] || []

        return (
          <div
            key={stage.key}
            className={cn(
              "flex flex-col min-w-[320px] w-80 bg-[#eaf0f6] rounded-lg border border-gray-200 shadow-sm transition-all",
              draggedOverStage === stage.key && "ring-2 ring-blue-400 border-transparent bg-blue-50/50"
            )}
            onDragOver={(e) => handleDragOver(e, stage.key)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, stage.key)}
          >
            {/* Column Header */}
            <div className="p-3 border-b border-gray-300/60 bg-white/50 rounded-t-lg">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xs font-bold text-[#001d3a] uppercase tracking-wider truncate flex-1 pr-2">
                  {stage.label}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-500 bg-gray-200/60 px-2 py-0.5 rounded">
                    {stageDeals.length}
                  </span>
                  <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Stage Progress Bar (Hubspot style) */}
            <div className="h-1 flex w-full">
              {DEAL_STAGES.map((s, idx) => (
                <div
                  key={s.key}
                  className={cn(
                    "flex-1 border-r border-white last:border-0",
                    DEAL_STAGES.findIndex(x => x.key === stage.key) >= idx ? "bg-blue-500" : "bg-gray-300"
                  )}
                />
              ))}
            </div>

            {/* Deals List */}
            <div className="flex-1 p-3 space-y-3 overflow-y-auto">
              {stageDeals.map((deal) => (
                <div
                  key={deal.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, deal)}
                  className={cn(
                    "group bg-white rounded-lg border border-gray-300 shadow-sm p-4 cursor-move hover:border-blue-400 hover:shadow-md transition-all relative",
                    draggedDeal?.id === deal.id && "opacity-40 grayscale-[0.5]"
                  )}
                >
                  <div className="flex flex-col gap-2">
                    <Link href={`/dashboard/deals/${deal.id}`} className="hover:underline">
                      <h4 className="text-sm font-bold text-[#0091ae] leading-tight">
                        {deal.title}
                      </h4>
                    </Link>

                    <div className="space-y-1 mt-1">
                      <div className="flex items-center text-[11px] text-gray-600">
                        <span className="w-24">Valor:</span>
                        <span className="font-semibold">{formatCurrency(deal.value)}</span>
                      </div>
                      <div className="flex items-center text-[11px] text-gray-600">
                        <span className="w-24">Data de fechamento:</span>
                        <span>{formatDate(deal.expectedClose)}</span>
                      </div>
                      <div className="flex items-center text-[11px] text-gray-600">
                        <span className="w-24">Proprietário:</span>
                        <span className="truncate">{deal.owner?.name || 'Não atribuído'}</span>
                      </div>
                      <div className="flex items-center text-[11px] text-gray-600">
                        <span className="w-24">Data de criação:</span>
                        <span>{formatDate(deal.createdAt || new Date())}</span>
                      </div>
                    </div>

                    <div className="pt-2 mt-2 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center text-[10px] text-gray-400 font-medium">
                          <CheckSquare className="h-3 w-3 mr-1" />
                          Tarefa há 8 dias
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="text-gray-400 hover:text-blue-500"><Edit2 className="h-3.5 w-3.5" /></button>
                        <button className="text-gray-400 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="flex items-center justify-end gap-2 mt-1">
                      <button className="h-6 w-6 rounded hover:bg-gray-100 flex items-center justify-center text-blue-600">
                        <MessageSquare className="h-3.5 w-3.5" />
                      </button>
                      <button className="h-6 w-6 rounded hover:bg-gray-100 flex items-center justify-center text-blue-600">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                      <div className="flex -space-x-1.5 ml-1">
                        {[1, 2].map(i => (
                          <div key={i} className="h-5 w-5 rounded-full border border-white bg-blue-100 flex items-center justify-center text-[8px] font-bold text-blue-600">
                            ED
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {stageDeals.length === 0 && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-gray-400">
                  <Plus className="h-6 w-6 mb-1 opacity-20" />
                  <span className="text-[10px] font-medium uppercase tracking-wider">Solte aqui</span>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
