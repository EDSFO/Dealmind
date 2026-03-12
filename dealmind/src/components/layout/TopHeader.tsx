'use client'

import { Search, HelpCircle, Bell, Settings, Sparkles, Plus } from 'lucide-react'
import { cn } from '~/lib/utils'

export function TopHeader() {
    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#27272a] bg-[#0a0a0a]/95 backdrop-blur-md px-6 text-white shadow-lg">
            <div className="flex flex-1 items-center gap-4 max-w-xl">
                <div className="relative group w-full">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-zinc-500 group-focus-within:text-white transition-colors" />
                    </div>
                    <input
                        type="text"
                        className="h-10 w-full rounded-lg bg-[#141414]/60 border border-[#3f3f46]/50 pl-10 pr-12 text-sm text-white placeholder-zinc-500 focus:bg-[#141414]/80 focus:border-[#f97316]/50 focus:outline-none focus:ring-1 focus:ring-[#f97316]/30 transition-all duration-300"
                        placeholder="Pesquisar contatos, negócios ou empresas..."
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                        <span className="text-[10px] font-bold text-zinc-600 border border-[#3f3f46]/50 px-1.5 py-0.5 rounded bg-[#1a1a1a]/50 leading-none">⌘ K</span>
                    </div>
                </div>
                <button className="flex h-10 w-10 min-w-[40px] items-center justify-center rounded-lg border border-[#3f3f46]/50 bg-[#141414]/40 hover:bg-[#27272a] hover:border-[#52525b] hover:scale-105 transition-all shadow-sm group">
                    <Plus className="h-5 w-5 text-zinc-400 group-hover:text-white transition-colors" />
                </button>
            </div>

            <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-1 border-r border-[#27272a]/50 pr-4 mr-1">
                    <button title="Ajuda" className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-[#27272a]/60 text-zinc-500 hover:text-white transition-all">
                        <HelpCircle className="h-5 w-5" />
                    </button>
                    <button title="Notificações" className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-[#27272a]/60 text-zinc-500 hover:text-white transition-all relative">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-[#f97316] rounded-full border border-[#0a0a0a]" />
                    </button>
                    <button title="Configurações" className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-[#27272a]/60 text-zinc-500 hover:text-white transition-all">
                        <Settings className="h-5 w-5" />
                    </button>
                </div>

                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#f97316] to-[#fb923c] hover:from-[#fb923c] hover:to-[#f97316] text-white text-[13px] font-bold shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all active:scale-95 group">
                    <Sparkles className="h-4 w-4 fill-white/20 group-hover:animate-pulse" />
                    Assistente AI
                </button>

                <div className="ml-1 flex items-center gap-3 cursor-pointer hover:bg-[#27272a]/40 p-1.5 pr-3 rounded-lg transition-all border border-transparent hover:border-[#3f3f46]/50">
                    <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-[#27272a] to-[#3f3f46] border border-[#52525b] flex items-center justify-center font-bold text-xs shadow-inner">
                        DM
                    </div>
                    <div className="hidden xl:flex flex-col">
                        <span className="text-xs font-bold text-white leading-tight">DealMind</span>
                        <span className="text-[10px] text-zinc-500 font-medium">Plano Pro</span>
                    </div>
                </div>
            </div>
        </header>
    )
}
