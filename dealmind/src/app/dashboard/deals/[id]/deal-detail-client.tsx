'use client'

import { useState } from 'react'
import Link from 'next/link'
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
    ChevronDown,
    ChevronUp,
    MessageSquare,
    Video,
    User,
    Building2,
    Calendar,
    ExternalLink,
    Search,
    Brain,
    ListTodo,
    Sparkles,
    X,
} from 'lucide-react'
import { cn } from '~/lib/utils'
import { createActivity } from './activity-actions'

// ─── Types ──────────────────────────────────────────────
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

interface Conversation {
    id: string
    subject: string | null
    source: string
    participants: any
    conversationDate: string | null
    createdAt: string
    updatedAt: string
    messages: any[]
    insight: any
    user: { id: string; name: string; email: string }
}

interface ContactData {
    id: string
    firstName: string | null
    lastName: string | null
    name: string | null
    email: string | null
    phone: string | null
    whatsapp: string | null
    position: string | null
    company: string | null
    status: string
}

interface CompanyData {
    id: string
    name: string
    website: string | null
    phone?: string | null
    segment: string | null
    city: string | null
    state: string | null
}

interface DealDetailClientProps {
    deal: any
    activities: Activity[]
    currentUserId: string
    currentUserName: string
}

// ─── Helpers ────────────────────────────────────────────
function formatDateTime(date: Date | string): string {
    return new Date(date).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

function formatDateFull(date: Date | string): string {
    return new Date(date).toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    })
}

function formatTime(date: Date | string): string {
    return new Date(date).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
    })
}

function getContactDisplayName(contact: ContactData | null): string {
    if (!contact) return ''
    if (contact.firstName && contact.lastName) return `${contact.firstName} ${contact.lastName}`
    if (contact.name) return contact.name
    if (contact.firstName) return contact.firstName
    return contact.email || 'Sem nome'
}

function getContactInitials(contact: ContactData | null): string {
    if (!contact) return '?'
    const name = getContactDisplayName(contact)
    const parts = name.split(' ')
    if (parts.length >= 2) return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase()
    return name.charAt(0).toUpperCase()
}

const ACTIVITY_TYPES = [
    { value: 'CALL', label: 'Chamadas', icon: Phone, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    { value: 'EMAIL', label: 'E-mails', icon: Mail, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
    { value: 'MEETING', label: 'Reuniões', icon: Video, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
    { value: 'TASK', label: 'Tarefas', icon: CheckSquare, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    { value: 'NOTE', label: 'Observações', icon: FileText, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' },
]

// ─── Main Component ─────────────────────────────────────
export default function DealDetailClient({ deal, activities, currentUserId, currentUserName }: DealDetailClientProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'activities'>('activities')
    const [activeFilter, setActiveFilter] = useState<string>('all')
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [createType, setCreateType] = useState('NOTE')
    const [searchTerm, setSearchTerm] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const conversations: Conversation[] = deal.conversations || []
    const contact: ContactData | null = deal.contact || null
    const company: CompanyData | null = deal.company || null

    // ─── Merge activities and conversations into one timeline ────
    type TimelineItem =
        | { kind: 'activity'; data: Activity; date: Date }
        | { kind: 'conversation'; data: Conversation; date: Date }

    const allItems: TimelineItem[] = [
        ...activities.map((a) => ({
            kind: 'activity' as const,
            data: a,
            date: new Date(a.createdAt),
        })),
        ...conversations.map((c) => ({
            kind: 'conversation' as const,
            data: c,
            date: new Date(c.conversationDate || c.createdAt),
        })),
    ].sort((a, b) => b.date.getTime() - a.date.getTime())

    // ─── Filter ────
    const typeFilteredItems = activeFilter === 'all'
        ? allItems
        : allItems.filter((item) => {
            if (item.kind === 'activity') {
                return item.data.type.toUpperCase() === activeFilter
            }
            if (item.kind === 'conversation') {
                const source = (item.data.source || 'MANUAL').toUpperCase()
                if (activeFilter === 'MEETING') return ['MEETING', 'VIDEO_CALL', 'CONFERENCE'].includes(source)
                if (activeFilter === 'CALL') return ['CALL', 'PHONE_CALL', 'PHONE'].includes(source)
                if (activeFilter === 'EMAIL') return ['EMAIL'].includes(source)
                return source === activeFilter
            }
            return false
        })

    const filteredItems = typeFilteredItems.filter((item) => {
        if (!searchTerm) return true
        const term = searchTerm.toLowerCase()

        if (item.kind === 'activity') {
            return (
                item.data.title.toLowerCase().includes(term) ||
                (item.data.description && item.data.description.toLowerCase().includes(term))
            )
        }

        if (item.kind === 'conversation') {
            return (
                (item.data.subject && item.data.subject.toLowerCase().includes(term)) ||
                (item.data.insight?.summary && item.data.insight.summary.toLowerCase().includes(term))
            )
        }
        return false
    })

    // ─── Group by month ────
    const groupedByDate = new Map<string, TimelineItem[]>()
    filteredItems.forEach((item) => {
        const monthYear = item.date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
        const key = monthYear.charAt(0).toUpperCase() + monthYear.slice(1) // capitalize
        if (!groupedByDate.has(key)) groupedByDate.set(key, [])
        groupedByDate.get(key)!.push(item)
    })

    const toggleExpand = (id: string) => {
        const newSet = new Set(expandedItems)
        if (newSet.has(id)) newSet.delete(id)
        else newSet.add(id)
        setExpandedItems(newSet)
    }

    const pendingActivities = activities.filter(a => a.status === 'PENDING' && a.dueAt && new Date(a.dueAt) >= new Date())

    return (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-0 min-h-[calc(100vh-180px)]">

            {/* ═══════════ LEFT: Main Content ═══════════ */}
            <div className="border-r border-gray-200 flex flex-col bg-white min-w-0">

                {/* Tabs */}
                <div className="border-b border-gray-200 bg-white px-6 flex items-center gap-8">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={cn(
                            "py-3.5 text-sm font-medium border-b-2 transition-colors",
                            activeTab === 'overview'
                                ? "border-blue-600 text-[#001d3a] font-bold"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                        )}
                    >
                        Visão geral
                    </button>
                    <button
                        onClick={() => setActiveTab('activities')}
                        className={cn(
                            "py-3.5 text-sm font-medium border-b-2 transition-colors",
                            activeTab === 'activities'
                                ? "border-blue-600 text-[#001d3a] font-bold"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                        )}
                    >
                        Atividades
                    </button>
                </div>

                {activeTab === 'activities' && (
                    <div className="flex-1 overflow-y-auto">
                        {/* Quick Actions & Search */}
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/30">
                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2">Registrar:</span>
                                {ACTIVITY_TYPES.map((type) => (
                                    <button
                                        key={type.value}
                                        onClick={() => {
                                            setCreateType(type.value)
                                            setShowCreateForm(true)
                                        }}
                                        className={cn(
                                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all hover:shadow-sm whitespace-nowrap",
                                            type.bg, type.border, type.color
                                        )}
                                    >
                                        <type.icon className="h-3.5 w-3.5" />
                                        {type.label}
                                    </button>
                                ))}
                            </div>

                            {/* Create Form Area */}
                            {showCreateForm && (
                                <div className="mb-4 bg-white rounded-lg border border-gray-200 p-4 shadow-sm animate-in fade-in slide-in-from-top-2">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-sm font-bold text-[#001d3a] flex items-center gap-2">
                                            <Plus className="h-4 w-4 text-blue-600" />
                                            Nova {ACTIVITY_TYPES.find(t => t.value === createType)?.label || 'Atividade'}
                                        </h3>
                                        <button
                                            onClick={() => setShowCreateForm(false)}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <form action={async (formData) => {
                                        setIsSubmitting(true)
                                        try {
                                            await createActivity(formData)
                                            setShowCreateForm(false)
                                            // Reset active filter to show the new item
                                            if (activeFilter !== 'all' && activeFilter !== createType) {
                                                setActiveFilter(createType)
                                            }
                                        } finally {
                                            setIsSubmitting(false)
                                        }
                                    }} className="space-y-3">
                                        <input type="hidden" name="dealId" value={deal.id} />
                                        <input type="hidden" name="type" value={createType} />

                                        <div>
                                            <input
                                                type="text"
                                                name="title"
                                                required
                                                placeholder="Título da atividade..."
                                                className="w-full text-sm font-medium border-0 border-b border-gray-200 px-0 py-2 focus:ring-0 focus:border-blue-500 placeholder:font-normal"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Data/Hora</label>
                                                <input
                                                    type="datetime-local"
                                                    name="dueAt"
                                                    className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 focus:ring-1 focus:ring-blue-500 hover:border-blue-300 transition-colors"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Responsável</label>
                                                <div className="text-xs border border-gray-200 rounded px-2 py-1.5 bg-gray-50 text-gray-600">
                                                    {currentUserName}
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <textarea
                                                name="description"
                                                rows={3}
                                                placeholder="Adicionar detalhes, notas ou pauta..."
                                                className="w-full text-sm border border-gray-200 rounded-lg p-3 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                            />
                                        </div>

                                        <div className="flex items-center justify-end gap-2 pt-2">
                                            <button
                                                type="button"
                                                onClick={() => setShowCreateForm(false)}
                                                className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-md"
                                                disabled={isSubmitting}
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                                            >
                                                {isSubmitting ? <Clock className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                                                {isSubmitting ? 'Salvando...' : 'Registrar'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Search Input */}
                            <div className="flex items-center gap-3">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Pesquisar em atividades e conversas..."
                                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
                                    />
                                </div>
                                <button className="px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 border border-gray-300 rounded-md whitespace-nowrap">
                                    Expandir tudo
                                </button>
                            </div>
                        </div>

                        {/* Activity Type Filters */}
                        <div className="px-6 py-2 border-b border-gray-100 flex items-center gap-1 flex-wrap">
                            <button
                                onClick={() => setActiveFilter('all')}
                                className={cn(
                                    "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                                    activeFilter === 'all'
                                        ? "bg-[#001d3a] text-white"
                                        : "text-gray-600 hover:bg-gray-100"
                                )}
                            >
                                Atividade
                            </button>
                            {ACTIVITY_TYPES.map((type) => (
                                <button
                                    key={type.value}
                                    onClick={() => setActiveFilter(type.value)}
                                    className={cn(
                                        "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                                        activeFilter === type.value
                                            ? "bg-[#001d3a] text-white"
                                            : "text-gray-600 hover:bg-gray-100"
                                    )}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>

                        {/* Filter row */}
                        <div className="px-6 py-2 border-b border-gray-100 flex items-center gap-3 text-xs text-gray-500">
                            <span>Filtrar por:</span>
                            <button className="px-2 py-1 bg-blue-50 text-blue-700 font-semibold rounded border border-blue-200 flex items-center gap-1">
                                Filtrar atividade (16/24) <ChevronDown className="h-3 w-3" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-800">
                                Todos os usuários <ChevronDown className="h-3 w-3 inline" />
                            </button>
                        </div>

                        {/* Future Events */}
                        {pendingActivities.length > 0 && (
                            <div className="px-6 py-4">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Eventos futuros</h3>
                                {pendingActivities.map((activity) => {
                                    const typeInfo = ACTIVITY_TYPES.find(t => t.value === activity.type.toUpperCase()) ?? ACTIVITY_TYPES[3]!
                                    const Icon = typeInfo.icon
                                    return (
                                        <div key={activity.id} className="border border-amber-200 bg-amber-50/50 rounded-lg p-4 mb-3">
                                            <div className="flex items-start gap-3">
                                                <div className={cn("p-2 rounded-lg", typeInfo.bg)}>
                                                    <Icon className={cn("h-4 w-4", typeInfo.color)} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-sm font-bold text-[#001d3a]">
                                                            <span className="text-orange-600">{typeInfo.label.slice(0, -1)}</span> atribuída para {activity.user?.name || currentUserName}
                                                        </p>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-gray-500">Ações</span>
                                                            <ChevronDown className="h-3 w-3 text-gray-400" />
                                                            <span className="text-xs text-gray-400">•</span>
                                                            <span className="text-xs text-red-500 font-medium">
                                                                Vencimento {activity.dueAt ? formatDateTime(activity.dueAt) : '-'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-gray-700 mt-1">{activity.title}</p>
                                                    {activity.description && (
                                                        <p className="text-xs text-gray-500 mt-2 italic">{activity.description}</p>
                                                    )}
                                                    <div className="flex items-center gap-4 mt-3 text-[11px] text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            Data de vencimento
                                                        </span>
                                                        <span className="font-medium">
                                                            {activity.dueAt ? formatDateFull(activity.dueAt).replace(/^\w/, c => c.toUpperCase()) : '-'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-3 pt-3 border-t border-amber-200/50 flex items-center gap-4 text-[11px] text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    Tipo: <span className="font-semibold text-gray-700">{typeInfo.label}</span>
                                                </span>
                                                <span>Prioridade: <span className="font-semibold text-gray-700">Nenhum</span></span>
                                                <span>Fila: <span className="font-semibold text-gray-700">Nenhum</span></span>
                                                <span>Atribuído a: <span className="font-semibold text-gray-700">{activity.user?.name || currentUserName}</span></span>
                                            </div>
                                            <button className="mt-3 text-xs text-blue-600 font-medium flex items-center gap-1 hover:text-blue-800">
                                                <MessageSquare className="h-3 w-3" /> Adicionar comentário
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {/* Timeline */}
                        <div className="px-6 py-4">
                            {Array.from(groupedByDate.entries()).map(([monthLabel, items]) => (
                                <div key={monthLabel} className="mb-6">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">{monthLabel}</h3>
                                    <div className="space-y-4">
                                        {items.map((item) => {
                                            if (item.kind === 'conversation') {
                                                return <ConversationTimelineItem key={item.data.id} conversation={item.data} isExpanded={expandedItems.has(item.data.id)} onToggle={() => toggleExpand(item.data.id)} />
                                            }
                                            return <ActivityTimelineItem key={item.data.id} activity={item.data} currentUserId={currentUserId} isExpanded={expandedItems.has(item.data.id)} onToggle={() => toggleExpand(item.data.id)} />
                                        })}
                                    </div>
                                </div>
                            ))}

                            {filteredItems.length === 0 && (
                                <div className="py-16 text-center">
                                    <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Clock className="h-8 w-8 text-gray-300" />
                                    </div>
                                    <h3 className="text-sm font-bold text-[#001d3a]">Nenhuma atividade registrada</h3>
                                    <p className="text-xs text-gray-500 mt-1">As atividades aparecerão aqui conforme forem adicionadas.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'overview' && (
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="space-y-6">
                            {/* Deal Info Cards */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Valor do negócio</p>
                                    <p className="text-2xl font-bold text-[#001d3a]">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(deal.value))}
                                    </p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Probabilidade</p>
                                    <p className="text-2xl font-bold text-[#001d3a]">{deal.probability}%</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Prioridade</p>
                                    <p className="text-sm font-bold text-[#001d3a]">{deal.priority}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Previsão de fechamento</p>
                                    <p className="text-sm font-bold text-[#001d3a]">
                                        {deal.expectedClose ? new Date(deal.expectedClose).toLocaleDateString('pt-BR') : 'Não definida'}
                                    </p>
                                </div>
                            </div>

                            {/* Description */}
                            {deal.description && (
                                <div className="bg-white rounded-lg border border-gray-200 p-4">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Descrição</h3>
                                    <p className="text-sm text-gray-700 leading-relaxed">{deal.description}</p>
                                </div>
                            )}

                            {/* Context */}
                            {(deal.clientProblem || deal.opportunityReason || deal.productSolution) && (
                                <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Contexto comercial</h3>
                                    {deal.clientProblem && (
                                        <div>
                                            <p className="text-[11px] font-bold text-gray-500 mb-0.5">Problema do cliente</p>
                                            <p className="text-sm text-gray-700">{deal.clientProblem}</p>
                                        </div>
                                    )}
                                    {deal.opportunityReason && (
                                        <div>
                                            <p className="text-[11px] font-bold text-gray-500 mb-0.5">Motivo da oportunidade</p>
                                            <p className="text-sm text-gray-700">{deal.opportunityReason}</p>
                                        </div>
                                    )}
                                    {deal.productSolution && (
                                        <div>
                                            <p className="text-[11px] font-bold text-gray-500 mb-0.5">Produto/solução</p>
                                            <p className="text-sm text-gray-700">{deal.productSolution}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Owner */}
                            <div className="bg-white rounded-lg border border-gray-200 p-4">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Responsável</h3>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                                        {deal.owner?.name?.charAt(0) || 'U'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-[#001d3a]">{deal.owner?.name || 'Não definido'}</p>
                                        <p className="text-xs text-gray-500">{deal.owner?.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ═══════════ RIGHT: Associations Sidebar ═══════════ */}
            <div className="bg-white overflow-y-auto">

                {/* Contacts */}
                <div className="border-b border-gray-200">
                    <div className="px-5 py-3 flex items-center justify-between">
                        <h3 className="text-xs font-bold text-[#001d3a] flex items-center gap-1">
                            <ChevronDown className="h-3 w-3" />
                            Contatos ({contact ? 1 : 0})
                        </h3>
                        <div className="flex items-center gap-2">
                            <button className="text-xs text-blue-600 font-medium hover:text-blue-800">+ Adicionar</button>
                        </div>
                    </div>

                    {contact ? (
                        <div className="px-5 pb-4">
                            {/* Search */}
                            <div className="relative mb-3">
                                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Pesquisar"
                                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <button className="absolute right-2 top-1.5 text-[10px] text-gray-500 px-1.5 py-0.5 bg-gray-100 rounded hover:bg-gray-200">
                                    Classificar
                                </button>
                            </div>

                            {/* Contact Card */}
                            <div className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer group">
                                <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs flex-shrink-0 border-2 border-white shadow-sm">
                                    {getContactInitials(contact)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <Link href={`/dashboard/contacts`} className="text-sm font-bold text-blue-700 hover:underline">
                                        {getContactDisplayName(contact)}
                                    </Link>
                                    {contact.position && (
                                        <p className="text-xs text-gray-500 mt-0.5">{contact.position}{contact.company ? ` na ${contact.company}` : ''}</p>
                                    )}
                                    {contact.email && (
                                        <p className="text-xs text-blue-600 mt-1 flex items-center gap-1 hover:underline">
                                            E-mail: {contact.email} <ExternalLink className="h-3 w-3 inline" />
                                        </p>
                                    )}
                                    {(contact.phone || contact.whatsapp) && (
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            Telefone: {contact.whatsapp || contact.phone || '—'}
                                        </p>
                                    )}
                                    <button className="text-[10px] text-blue-600 font-medium mt-2 hover:text-blue-800">
                                        Adicionar rótulo de associação
                                    </button>
                                </div>
                            </div>

                            <button className="mt-3 text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 px-1">
                                Exibir todos os Contatos associados <ExternalLink className="h-3 w-3" />
                            </button>
                        </div>
                    ) : (
                        <div className="px-5 pb-4">
                            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                                <User className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                                <p className="text-xs text-gray-500">Nenhum contato associado</p>
                                <button className="mt-2 text-xs text-blue-600 font-bold hover:text-blue-800">
                                    + Adicionar contato
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Companies */}
                <div className="border-b border-gray-200">
                    <div className="px-5 py-3 flex items-center justify-between">
                        <h3 className="text-xs font-bold text-[#001d3a] flex items-center gap-1">
                            <ChevronDown className="h-3 w-3" />
                            Empresas ({company ? 1 : 0})
                        </h3>
                        <div className="flex items-center gap-2">
                            <button className="text-xs text-blue-600 font-medium hover:text-blue-800">+ Adicionar</button>
                        </div>
                    </div>

                    {company ? (
                        <div className="px-5 pb-4">
                            <div className="relative mb-3">
                                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Pesquisar"
                                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <button className="absolute right-2 top-1.5 text-[10px] text-gray-500 px-1.5 py-0.5 bg-gray-100 rounded hover:bg-gray-200">
                                    Classificar
                                </button>
                            </div>

                            <div className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer">
                                <div className="h-10 w-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs flex-shrink-0 border border-purple-200">
                                    <Building2 className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <Link href={`/dashboard/companies`} className="text-sm font-bold text-blue-700 hover:underline">
                                            {company.name}
                                        </Link>
                                        {company.segment && (
                                            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded">
                                                Principal
                                            </span>
                                        )}
                                    </div>
                                    {company.website && (
                                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                            Nome de domínio da empresa: <span className="text-blue-600 hover:underline">{company.website}</span> <ExternalLink className="h-3 w-3" />
                                        </p>
                                    )}
                                    {(company.city || company.state) && (
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {[company.city, company.state].filter(Boolean).join(', ')}
                                        </p>
                                    )}
                                    <button className="text-[10px] text-blue-600 font-medium mt-2 hover:text-blue-800">
                                        Adicionar rótulo de associação
                                    </button>
                                </div>
                            </div>

                            <button className="mt-3 text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 px-1">
                                Exibir todas as Empresas associadas <ExternalLink className="h-3 w-3" />
                            </button>
                        </div>
                    ) : (
                        <div className="px-5 pb-4">
                            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                                <Building2 className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                                <p className="text-xs text-gray-500">Nenhuma empresa associada</p>
                                <button className="mt-2 text-xs text-blue-600 font-bold hover:text-blue-800">
                                    + Adicionar empresa
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Tickets / Deals (placeholder) */}
                <div className="border-b border-gray-200">
                    <div className="px-5 py-3 flex items-center justify-between">
                        <h3 className="text-xs font-bold text-[#001d3a] flex items-center gap-1">
                            <ChevronDown className="h-3 w-3" />
                            Tickets (0)
                        </h3>
                        <button className="text-xs text-blue-600 font-medium hover:text-blue-800">+ Adicionar</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── Conversation Timeline Item ─────────────────────────
function ConversationTimelineItem({
    conversation,
    isExpanded,
    onToggle,
}: {
    conversation: Conversation
    isExpanded: boolean
    onToggle: () => void
}) {
    const participantsArr = Array.isArray(conversation.participants) ? conversation.participants : []
    const messageCount = conversation.messages?.length || 0
    const date = conversation.conversationDate || conversation.createdAt

    // Helper to parse insight data that might be trapped in a JSON string summary
    const getEnrichedInsight = () => {
        const insight = conversation.insight
        if (!insight) return null

        let data: any = { ...insight }

        // Check if summary is actually a JSON string
        if (typeof data.summary === 'string' && data.summary.trim().startsWith('{')) {
            try {
                const parsed = JSON.parse(data.summary)
                data = { ...data, ...parsed }
                // Ensure text summary is correct
                if (parsed.summary) data.summary = parsed.summary
            } catch (e) {
                // Not JSON, keep as is
            }
        }
        return data
    }

    const enrichedInsight = isExpanded ? getEnrichedInsight() : null

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden hover:border-blue-200 transition-colors">
            {/* Header */}
            <div
                className="px-4 py-3 bg-white cursor-pointer flex items-start gap-3"
                onClick={onToggle}
            >
                <div className="p-2 bg-purple-50 rounded-lg text-purple-600 flex-shrink-0 mt-0.5">
                    <Video className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-[#001d3a]">
                                Reunião - <span className="text-blue-700">{conversation.subject || 'Sem assunto'}</span>
                                {' '}organizado por {conversation.user?.name || '—'}
                            </p>
                            {participantsArr.length > 0 && (
                                <p className="text-xs text-gray-500 mt-0.5 truncate">
                                    com {participantsArr.map((p: any) => p.name || p.email || '').join(', ')}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                            <button className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
                                Ações <ChevronDown className="h-3 w-3" />
                            </button>
                            <span className="text-xs text-gray-400">
                                {formatDateTime(date)}
                            </span>
                        </div>
                    </div>

                    {/* Source info */}
                    {conversation.source && conversation.source !== 'MANUAL' && (
                        <p className="text-[11px] text-gray-500 mt-1.5">
                            Título: <span className="font-semibold">{conversation.subject}</span>
                        </p>
                    )}

                    <div className="flex items-center gap-4 mt-2 text-[11px] text-gray-500">
                        <span>Resultado: <span className="font-semibold text-gray-700">Nenhum</span></span>
                        <span>Participantes: <span className="font-semibold text-gray-700">{participantsArr.length || 1} participantes</span></span>
                        <span>Duração: <span className="font-semibold text-gray-700">{messageCount > 0 ? `${messageCount} mensagens` : 'Indisponível'}</span></span>
                    </div>
                </div>
                <button className="p-1 text-gray-400 hover:text-gray-600 mt-1">
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
            </div>

            {/* Expanded content */}
            {enrichedInsight && (
                <div className="px-5 py-4 bg-purple-50/50 border-t border-purple-100">
                    <div className="flex items-start gap-4">
                        <Sparkles className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 space-y-4">

                            {/* Summary */}
                            {enrichedInsight.summary && (
                                <div>
                                    <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wide mb-1 flex items-center gap-1">
                                        Resumo Executivo
                                    </h4>
                                    <p className="text-sm text-gray-700 leading-relaxed bg-white/60 p-3 rounded border border-purple-100/50 shadow-sm">
                                        {enrichedInsight.summary}
                                    </p>
                                </div>
                            )}

                            {/* Interests */}
                            {enrichedInsight.interests && Array.isArray(enrichedInsight.interests) && enrichedInsight.interests.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                                        Interesses Identificados
                                    </h4>
                                    <ul className="space-y-1">
                                        {enrichedInsight.interests.map((item: string, i: number) => (
                                            <li key={i} className="text-xs text-gray-700 flex items-start gap-2">
                                                <div className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Objections */}
                            {enrichedInsight.objections && Array.isArray(enrichedInsight.objections) && enrichedInsight.objections.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-bold text-red-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" /> Objeções
                                    </h4>
                                    <ul className="space-y-1">
                                        {enrichedInsight.objections.map((item: string, i: number) => (
                                            <li key={i} className="text-xs text-gray-700 flex items-start gap-2">
                                                <div className="h-1.5 w-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Commitments */}
                            {enrichedInsight.commitments && Array.isArray(enrichedInsight.commitments) && enrichedInsight.commitments.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-bold text-green-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                                        <CheckCircle2 className="h-3 w-3" /> Compromissos
                                    </h4>
                                    <ul className="space-y-1">
                                        {enrichedInsight.commitments.map((item: string, i: number) => (
                                            <li key={i} className="text-xs text-gray-700 flex items-start gap-2">
                                                <div className="h-1.5 w-1.5 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Next Actions */}
                            {enrichedInsight.nextActions && Array.isArray(enrichedInsight.nextActions) && enrichedInsight.nextActions.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wide mb-2 flex items-center gap-1">
                                        <ListTodo className="h-3 w-3" /> Próximos passos
                                    </h4>
                                    <ul className="space-y-1.5 bg-white rounded border border-purple-100 p-3 shadow-sm">
                                        {enrichedInsight.nextActions.map((action: any, i: number) => (
                                            <li key={i} className="text-xs text-gray-700 flex items-start gap-2">
                                                <div className="h-1.5 w-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                                                <span>{typeof action === 'string' ? action : JSON.stringify(action)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Risk Signals */}
                            {enrichedInsight.riskSignals && Array.isArray(enrichedInsight.riskSignals) && enrichedInsight.riskSignals.length > 0 && (
                                <div className="mt-3">
                                    <h4 className="text-[10px] font-bold text-red-600 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                                        <AlertCircle className="h-3 w-3" /> Riscos detectados
                                    </h4>
                                    <div className="flex flex-wrap gap-1.5">
                                        {enrichedInsight.riskSignals.map((risk: any, i: number) => (
                                            <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-red-50 text-red-700 border border-red-100">
                                                {typeof risk === 'string' ? risk : 'Risco detectado'}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="px-4 py-2 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                <button className="text-xs text-blue-600 font-medium flex items-center gap-1 hover:text-blue-800">
                    <MessageSquare className="h-3 w-3" /> Adicionar comentário
                </button>
                <span className="text-[10px] text-gray-400">
                    {messageCount} associações
                </span>
            </div>
        </div>
    )
}

// ─── Activity Timeline Item ─────────────────────────────
function ActivityTimelineItem({
    activity,
    currentUserId,
    isExpanded,
    onToggle,
}: {
    activity: Activity
    currentUserId: string
    isExpanded: boolean
    onToggle: () => void
}) {
    const typeInfo = ACTIVITY_TYPES.find(t => t.value === activity.type.toUpperCase()) || ACTIVITY_TYPES[4]!
    const Icon = typeInfo.icon
    const isCompleted = activity.status === 'COMPLETED'
    const isOverdue = activity.dueAt && new Date(activity.dueAt) < new Date() && !isCompleted

    return (
        <div className={cn(
            "border rounded-lg overflow-hidden transition-colors",
            isCompleted ? "border-gray-200 opacity-75" : isOverdue ? "border-red-200" : "border-gray-200 hover:border-blue-200"
        )}>
            <div
                className="px-4 py-3 bg-white cursor-pointer flex items-start gap-3"
                onClick={onToggle}
            >
                <div className={cn("p-2 rounded-lg flex-shrink-0 mt-0.5", typeInfo.bg)}>
                    <Icon className={cn("h-4 w-4", typeInfo.color)} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <p className={cn(
                            "text-sm font-bold",
                            isCompleted ? "text-gray-500 line-through" : "text-[#001d3a]"
                        )}>
                            <span className={typeInfo.color}>{typeInfo.label.slice(0, -1)}</span>
                            {' '}— {activity.title}
                        </p>
                        <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                            <button className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
                                Ações <ChevronDown className="h-3 w-3" />
                            </button>
                            <span className={cn("text-xs", isOverdue ? "text-red-500 font-semibold" : "text-gray-400")}>
                                {formatDateTime(activity.createdAt)}
                            </span>
                        </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-0.5">
                        Atribuída a: <span className="font-semibold">{activity.user?.name || 'Sistema'}</span>
                    </p>

                    {isExpanded && activity.description && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <p className="text-xs text-gray-600 leading-relaxed">{activity.description}</p>
                        </div>
                    )}

                    <div className="flex items-center gap-4 mt-2 text-[11px] text-gray-500">
                        <span>Tipo: <span className="font-semibold text-gray-700">{typeInfo.label}</span></span>
                        {activity.dueAt && (
                            <span className={cn(isOverdue ? "text-red-500 font-semibold" : "")}>
                                Vencimento: <span className="font-semibold">{formatDateTime(activity.dueAt)}</span>
                            </span>
                        )}
                        {isCompleted && (
                            <span className="text-green-600 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" /> Concluída
                            </span>
                        )}
                    </div>
                </div>
                <button className="p-1 text-gray-400 hover:text-gray-600 mt-1">
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
            </div>

            <div className="px-4 py-2 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                <button className="text-xs text-blue-600 font-medium flex items-center gap-1 hover:text-blue-800">
                    <MessageSquare className="h-3 w-3" /> Adicionar comentário
                </button>
                <span className="text-[10px] text-gray-400">
                    1 associação
                </span>
            </div>
        </div>
    )
}
