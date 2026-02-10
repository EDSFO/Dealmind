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
    Target
} from 'lucide-react'

const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/contacts', icon: Users, label: 'Contatos' },
    { href: '/dashboard/deals', icon: Target, label: 'Negócios' },
    { href: '/dashboard/companies', icon: Building2, label: 'Empresas' },
    { href: '/dashboard/conversations', icon: MessageSquare, label: 'Conversas' },
    { href: '/dashboard/analytics', icon: LayoutDashboard, label: 'Análise' },
    { href: '/dashboard/users', icon: Settings, label: 'Configurações' },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <aside className="fixed inset-y-0 left-0 z-40 w-16 lg:w-48 bg-hubspot-dark text-slate-300 flex flex-col transition-all duration-300 shadow-xl border-r border-slate-800">
            <div className="h-16 flex items-center px-4 mb-4 mt-2">
                <Link href="/dashboard" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 bg-hubspot-orange rounded-xl flex items-center justify-center shadow-lg shadow-orange-950/20 group-hover:scale-105 transition-transform">
                        <span className="text-white font-bold text-xl">D</span>
                    </div>
                    <span className="hidden lg:block text-xl font-bold text-white tracking-tight ml-1">
                        Deal<span className="text-hubspot-orange">Mind</span>
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
                                ? 'bg-slate-800/80 text-white shadow-sm'
                                : 'hover:bg-slate-800/40 hover:text-white'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 min-w-[20px] transition-colors ${isActive ? 'text-hubspot-orange' : 'text-slate-400 group-hover:text-white'}`} />
                            <span className={`hidden lg:block text-[13px] font-semibold whitespace-nowrap transition-all ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
                                {item.label}
                            </span>
                            {isActive && (
                                <div className="absolute left-[-12px] w-1.5 h-6 bg-hubspot-orange rounded-r-full shadow-[2px_0_8px_rgba(255,92,53,0.4)]" />
                            )}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-slate-800/50 space-y-2">
                <button className="flex items-center gap-3 w-full px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800/40 rounded-lg transition-all group">
                    <Settings className="w-5 h-5 min-w-[20px] group-hover:rotate-45 transition-transform duration-500" />
                    <span className="hidden lg:block text-[13px] font-medium">Configurações</span>
                </button>
                <div className="pt-2 px-3">
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-hubspot-orange w-2/3 rounded-full shadow-[0_0_8px_rgba(255,92,53,0.3)]" />
                    </div>
                    <p className="hidden lg:block text-[10px] text-slate-500 mt-2 font-medium">Uso do Armazenamento: 65%</p>
                </div>
            </div>
        </aside>
    )
}
