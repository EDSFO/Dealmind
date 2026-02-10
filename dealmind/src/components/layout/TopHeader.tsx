'use client'

import { Search, HelpCircle, Bell, Settings, Sparkles, Plus } from 'lucide-react'
import { cn } from '~/lib/utils'

export function TopHeader() {
    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-800 bg-hubspot-blue px-6 text-white shadow-lg">
            <div className="flex flex-1 items-center gap-4 max-w-xl">
                <div className="relative group w-full">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-400 group-focus-within:text-white transition-colors" />
                    </div>
                    <input
                        type="text"
                        className="h-10 w-full rounded-lg bg-slate-900/40 border border-slate-700/50 pl-10 pr-12 text-sm text-white placeholder-slate-500 focus:bg-slate-900/60 focus:border-hubspot-orange/50 focus:outline-none focus:ring-1 focus:ring-hubspot-orange/30 transition-all duration-300"
                        placeholder="Pesquisar contatos, negócios ou empresas..."
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                        <span className="text-[10px] font-bold text-slate-600 border border-slate-700/50 px-1.5 py-0.5 rounded bg-slate-800/50 leading-none">⌘ K</span>
                    </div>
                </div>
                <button className="flex h-10 w-10 min-w-[40px] items-center justify-center rounded-lg border border-slate-700/50 bg-slate-800/40 hover:bg-slate-800 hover:border-slate-500 hover:scale-105 transition-all shadow-sm group">
                    <Plus className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
                </button>
            </div>

            <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-1 border-r border-slate-700/50 pr-4 mr-1">
                    <button title="Ajuda" className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-slate-800/60 text-slate-400 hover:text-white transition-all">
                        <HelpCircle className="h-5 w-5" />
                    </button>
                    <button title="Notificações" className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-slate-800/60 text-slate-400 hover:text-white transition-all relative">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-hubspot-orange rounded-full border border-hubspot-blue" />
                    </button>
                    <button title="Configurações" className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-slate-800/60 text-slate-400 hover:text-white transition-all">
                        <Settings className="h-5 w-5" />
                    </button>
                </div>

                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#ff5c35] to-[#ff7a59] hover:from-[#ff7a59] hover:to-[#ff5c35] text-white text-[13px] font-bold shadow-lg shadow-orange-950/40 transition-all active:scale-95 group">
                    <Sparkles className="h-4 w-4 fill-white/20 group-hover:animate-pulse" />
                    Assistente AI
                </button>

                <div className="ml-1 flex items-center gap-3 cursor-pointer hover:bg-slate-800/40 p-1.5 pr-3 rounded-lg transition-all border border-transparent hover:border-slate-700/50">
                    <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 flex items-center justify-center font-bold text-xs shadow-inner">
                        DM
                    </div>
                    <div className="hidden xl:flex flex-col">
                        <span className="text-xs font-bold text-white leading-tight">DealMind</span>
                        <span className="text-[10px] text-slate-400 font-medium">Plano Pro</span>
                    </div>
                </div>
            </div>
        </header>
    )
}
