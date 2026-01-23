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
    { href: '/dashboard/users', icon: Settings, label: 'Configurações' },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <aside className="fixed inset-y-0 left-0 z-40 w-16 lg:w-48 bg-[#00142c] text-slate-300 flex flex-col transition-all duration-300">
            <div className="h-16 flex items-center px-4 mb-2">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
                        <span className="text-white font-bold">D</span>
                    </div>
                    <span className="hidden lg:block text-xl font-bold text-white tracking-tight">DealMind</span>
                </Link>
            </div>

            <nav className="flex-1 px-2 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-3 rounded-md transition-all group ${isActive
                                    ? 'bg-slate-700/50 text-white'
                                    : 'hover:bg-slate-700/30 hover:text-white'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 min-w-[20px] ${isActive ? 'text-orange-400' : 'text-slate-400 group-hover:text-white'}`} />
                            <span className={`hidden lg:block text-sm font-medium whitespace-nowrap overflow-hidden transition-all ${isActive ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'
                                }`}>
                                {item.label}
                            </span>
                            {isActive && (
                                <div className="absolute left-0 w-1 h-8 bg-orange-500 rounded-r-full lg:hidden" />
                            )}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-slate-700/50">
                <button className="flex items-center gap-3 w-full px-2 py-2 text-slate-400 hover:text-white transition-colors">
                    <Settings className="w-5 h-5 min-w-[20px]" />
                    <span className="hidden lg:block text-sm font-medium">Suporte</span>
                </button>
            </div>
        </aside>
    )
}
