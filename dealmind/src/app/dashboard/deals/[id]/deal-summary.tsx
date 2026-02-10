'use client'

import {
    Brain,
    FileText,
    ListTodo,
    List,
    ShieldAlert,
    Users,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Share2,
    MoreHorizontal,
    ThumbsUp,
    ThumbsDown,
    Clock,
    Calendar,
    MessageSquare
} from 'lucide-react'
import { cn } from '~/lib/utils'
import { useState } from 'react'

interface DealSummaryProps {
    deal: any // Replace with proper type when available
}

export default function DealSummary({ deal }: DealSummaryProps) {
    const [activeTab, setActiveTab] = useState<'chat' | 'topics' | 'notes' | 'actions'>('topics')

    return (
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
            {/* Header Section */}
            <div className="border-b px-6 py-4 flex items-center justify-between bg-white">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wide">
                            Reunião
                        </span>
                        <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Sex, 12 Jan • 10:00 - 11:00
                        </span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">{deal.title || "CDM Service x SoftExpert"}</h2>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition">
                        Ver gravação
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
                        <Share2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden">

                {/* Left/Center Column - Summary Content */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-200">

                    {/* Tabs */}
                    <div className="flex items-center gap-6 border-b mb-6">
                        <button
                            onClick={() => setActiveTab('chat')}
                            className={cn("pb-3 text-sm font-medium transition-colors relative", activeTab === 'chat' ? "text-blue-600" : "text-gray-500 hover:text-gray-700")}
                        >
                            <div className="flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" /> Chat
                            </div>
                            {activeTab === 'chat' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />}
                        </button>
                        <button
                            onClick={() => setActiveTab('topics')}
                            className={cn("pb-3 text-sm font-medium transition-colors relative", activeTab === 'topics' ? "text-blue-600" : "text-gray-500 hover:text-gray-700")}
                        >
                            <div className="flex items-center gap-2">
                                <Brain className="w-4 h-4" /> Tópicos & IA
                            </div>
                            {activeTab === 'topics' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />}
                        </button>
                        <button
                            onClick={() => setActiveTab('notes')}
                            className={cn("pb-3 text-sm font-medium transition-colors relative", activeTab === 'notes' ? "text-blue-600" : "text-gray-500 hover:text-gray-700")}
                        >
                            <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4" /> Notas
                            </div>
                            {activeTab === 'notes' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />}
                        </button>
                        <button
                            onClick={() => setActiveTab('actions')}
                            className={cn("pb-3 text-sm font-medium transition-colors relative", activeTab === 'actions' ? "text-blue-600" : "text-gray-500 hover:text-gray-700")}
                        >
                            <div className="flex items-center gap-2">
                                <ListTodo className="w-4 h-4" /> Ações
                            </div>
                            {activeTab === 'actions' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />}
                        </button>
                    </div>

                    {/* AI Analysis Section */}
                    <div className="space-y-8">

                        {/* Analise Inteligente */}
                        <section className="bg-blue-50/50 rounded-xl p-5 border border-blue-100">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-1.5 bg-blue-100 rounded-md text-blue-600">
                                    <Brain className="w-5 h-5" />
                                </div>
                                <h3 className="text-base font-bold text-gray-900">Análise Inteligente</h3>
                            </div>
                            <div className="grid gap-3">
                                {[
                                    "Discussão aprofundada sobre as necessidades da SoftExpert em relação à gestão de contratos.",
                                    "Principais dores identificadas: falta de visibilidade sobre prazos de renovação e dificuldade na busca de cláusulas específicas.",
                                    "Interesse claro na funcionalidade de automação de contratos via IA generativa.",
                                    "Orçamento aprovado para Q1, com intenção de fechar negócio até o final do mês."
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-3 items-start group">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 group-hover:scale-125 transition-transform" />
                                        <p className="text-sm text-gray-700 leading-relaxed">{item}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Smart Summary / Resumo Executivo */}
                        <section>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-gray-400" />
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Resumo Executivo</h3>
                                </div>
                                <div className="flex gap-1">
                                    <button className="p-1 text-gray-400 hover:text-green-500"><ThumbsUp className="w-3.5 h-3.5" /></button>
                                    <button className="p-1 text-gray-400 hover:text-red-500"><ThumbsDown className="w-3.5 h-3.5" /></button>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed pl-7 border-l-2 border-gray-100 italic">
                                A reunião foi extremamente produtiva. O cliente demonstrou alto engajamento e validou a aderência da solução aos problemas apresentados. Houve um foco significativo em segurança e compliance, que foram endereçados satisfatoriamente. O próximo passo crucial é a apresentação da proposta comercial revisada.
                            </p>
                        </section>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Next Steps */}
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <ListTodo className="w-5 h-5 text-gray-400" />
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Próximos Passos</h3>
                                </div>
                                <div className="space-y-3">
                                    {[
                                        { text: "Enviar proposta comercial revisada", owner: "Eduardo" },
                                        { text: "Agendar demo técnica para engenharia", owner: "Daniel" },
                                        { text: "Compartilhar cases de sucesso", owner: "Eduardo" }
                                    ].map((step, i) => (
                                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-sm transition-all cursor-pointer group">
                                            <div className="mt-0.5 w-4 h-4 rounded border border-gray-300 group-hover:border-blue-500 flex items-center justify-center bg-white transition-colors">
                                                {/* Checkbox imitation */}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-700 underline-offset-2 group-hover:underline decoration-blue-200">{step.text}</p>
                                                <span className="text-[10px] uppercase font-bold text-gray-400 mt-1 block">Responsável: {step.owner}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Topics */}
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <List className="w-5 h-5 text-gray-400" />
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Tópicos e Contexto</h3>
                                </div>
                                <div className="space-y-4">
                                    {[
                                        { title: "Visão Geral", desc: "Apresentação dash, pipeline e relatórios via BI." },
                                        { title: "Integrações", desc: "Discussão sobre API REST e Webhooks para ERP." },
                                        { title: "Pricing", desc: "Detalhamento dos planos Enterprise e seats adicionais." }
                                    ].map((topic, i) => (
                                        <div key={i} className="pl-3 border-l-2 border-gray-200 hover:border-blue-400 transition-colors">
                                            <h4 className="text-xs font-bold text-gray-900 uppercase">{topic.title}</h4>
                                            <p className="text-sm text-gray-600 mt-0.5">{topic.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-100">
                            {/* Objections */}
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <ShieldAlert className="w-5 h-5 text-gray-400" />
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Objeções</h3>
                                </div>
                                <ul className="space-y-2">
                                    <li className="flex gap-2 items-start text-sm text-gray-600">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                                        <span><strong className="text-gray-900">Preço:</strong> O valor inicial parece alto para o budget atual.</span>
                                    </li>
                                    <li className="flex gap-2 items-start text-sm text-gray-600">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                                        <span><strong className="text-gray-900">Segurança:</strong> Dúvidas sobre armazenamento em nuvem pública.</span>
                                    </li>
                                </ul>
                            </section>

                            {/* Competitors */}
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <Users className="w-5 h-5 text-gray-400" />
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Competidores Citados</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {["TOTVS", "SAP", "Salesforce", "Oracle", "Microsoft"].map(comp => (
                                        <span key={comp} className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold border border-gray-200">
                                            {comp}
                                        </span>
                                    ))}
                                </div>
                            </section>
                        </div>

                    </div>
                </div>

                {/* Right Sidebar - Participants */}
                <div className="w-80 border-l bg-gray-50/50 p-6 flex flex-col gap-6">

                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Participantes</h3>
                            <span className="px-2 py-0.5 bg-gray-200 rounded-full text-[10px] font-bold text-gray-600">2</span>
                        </div>

                        <div className="space-y-4">
                            {/* Participant 1 */}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border-2 border-white shadow-sm">
                                    EV
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">Eduardo Varela</p>
                                    <p className="text-xs text-blue-600 font-medium">Anfitrião (Você)</p>
                                </div>
                            </div>

                            {/* Participant 2 */}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold border-2 border-white shadow-sm">
                                    DM
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{deal.contact?.name || "Daniel Macedo"}</p>
                                    <p className="text-xs text-gray-500">{deal.contact?.company || "SoftExpert"}</p>
                                </div>
                                <div className="ml-auto">
                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded">Decision Maker</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-200">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Compromissos</h3>
                        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                            <div className="flex items-start gap-3">
                                <div className="bg-orange-50 p-2 rounded text-orange-600">
                                    <Calendar className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-900">Follow-up: Proposta</p>
                                    <p className="text-[10px] text-gray-500 mt-1">15 Jan, 2024 • 14:00</p>
                                </div>
                            </div>
                            <button className="w-full mt-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition">
                                Ver na agenda
                            </button>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-200">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-[10px] font-bold">Quente</span>
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-[10px] font-bold">Enterprise</span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-bold">+ Adicionar</span>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    )
}
