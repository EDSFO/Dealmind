'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Users,
    Briefcase,
    MessageSquare,
    Building2,
    Settings,
    Target,
    LifeBuoy,
    Calendar
} from 'lucide-react'

const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/contacts', icon: Users, label: 'Contatos' },
    { href: '/dashboard/activities', icon: Calendar, label: 'Atividades' },
    { href: '/dashboard/deals', icon: Target, label: 'Negócios' },
    { href: '/dashboard/companies', icon: Building2, label: 'Empresas' },
    { href: '/dashboard/tickets', icon: LifeBuoy, label: 'Tickets' },
    { href: '/dashboard/conversations', icon: MessageSquare, label: 'Conversas' },
    { href: '/dashboard/analytics', icon: LayoutDashboard, label: 'Análise' },
    { href: '/dashboard/users', icon: Users, label: 'Equipe' },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <aside className="fixed inset-y-0 left-0 z-40 w-16 lg:w-52 bg-[#0a0a0a] text-zinc-300 flex flex-col transition-all duration-300 shadow-xl border-r border-[#27272a]">
            <div className="h-16 flex items-center px-4 mb-4 mt-2">
                <Link href="/dashboard" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#f97316] to-[#fb923c] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.3)] group-hover:scale-105 transition-transform">
                        <span className="text-white font-bold text-xl">D</span>
                    </div>
                    <span className="hidden lg:block text-xl font-bold text-white tracking-tight ml-1">
                        Deal<span className="text-[#f97316]">Mind</span>
                    </span>
                </Link>
            </div>

            <nav className="flex-1 px-3 space-y-1.5">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative ${isActive
                                ? 'bg-[#27272a]/80 text-white shadow-sm'
                                : 'hover:bg-[#27272a]/40 hover:text-white'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 min-w-[20px] transition-colors ${isActive ? 'text-[#f97316]' : 'text-zinc-500 group-hover:text-white'}`} />
                            <span className={`hidden lg:block text-[13px] font-semibold whitespace-nowrap transition-all ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
                                {item.label}
                            </span>
                            {isActive && (
                                <div className="absolute left-[-12px] w-1.5 h-6 bg-[#f97316] rounded-r-full shadow-[2px_0_8px_rgba(249,115,22,0.4)]" />
                            )}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-[#27272a]/50 space-y-2">
                <Link href="/dashboard/settings" className="flex items-center gap-3 w-full px-3 py-2 text-zinc-500 hover:text-white hover:bg-[#27272a]/40 rounded-lg transition-all group">
                    <Settings className="w-5 h-5 min-w-[20px] group-hover:rotate-45 transition-transform duration-500" />
                    <span className="hidden lg:block text-[13px] font-medium">Configurações</span>
                </Link>
                <div className="pt-2 px-3">
                    <div className="h-1.5 w-full bg-[#27272a] rounded-full overflow-hidden">
                        <div className="h-full bg-[#f97316] w-2/3 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.3)]" />
                    </div>
                    <p className="hidden lg:block text-[10px] text-zinc-600 mt-2 font-medium">Uso do Armazenamento: 65%</p>
                </div>
            </div>
        </aside>
    )
}
