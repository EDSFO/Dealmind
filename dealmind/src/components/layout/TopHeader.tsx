'use client'

import { Search, HelpCircle, Bell, Settings, Sparkles, Plus } from 'lucide-react'
import { cn } from '~/lib/utils'

export function TopHeader() {
    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-[#001d3a] px-6 text-white">
            <div className="flex flex-1 items-center gap-4 max-w-xl">
                <div className="relative group w-full">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-400 group-focus-within:text-white transition-colors" />
                    </div>
                    <input
                        type="text"
                        className="h-10 w-full rounded-md bg-slate-800/50 border border-slate-700 pl-10 pr-12 text-sm text-white placeholder-slate-400 focus:bg-slate-800 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 transition-all"
                        placeholder="Pesquisar no DealMind"
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center items-center pointer-events-none">
                        <span className="text-[10px] font-medium text-slate-500 border border-slate-700 px-1.5 py-0.5 rounded leading-none">Ctrl K</span>
                    </div>
                </div>
                <button className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-slate-500 transition-all">
                    <Plus className="h-5 w-5 text-slate-400" />
                </button>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 border-r border-slate-700 pr-3 mr-1">
                    <button className="h-9 w-9 flex items-center justify-center rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                        <HelpCircle className="h-5 w-5" />
                    </button>
                    <button className="h-9 w-9 flex items-center justify-center rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                        <Bell className="h-5 w-5" />
                    </button>
                    <button className="h-9 w-9 flex items-center justify-center rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                        <Settings className="h-5 w-5" />
                    </button>
                </div>

                <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-semibold shadow-lg shadow-orange-950/20 transition-all">
                    <Sparkles className="h-4 w-4 fill-white/20" />
                    Assistente
                </button>

                <div className="ml-2 flex items-center gap-2 cursor-pointer hover:bg-slate-800 p-1.5 rounded-md transition-colors">
                    <div className="h-8 w-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center font-bold text-xs">
                        DM
                    </div>
                    <span className="hidden xl:block text-sm font-medium text-slate-300">DealMind</span>
                </div>
            </div>
        </header>
    )
}
