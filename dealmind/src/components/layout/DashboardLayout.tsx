'use client'

import { Sidebar } from './Sidebar'
import { TopHeader } from './TopHeader'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#f5f8fa]">
            <Sidebar />
            <div className="lg:pl-48 transition-all duration-300">
                <TopHeader />
                <main>
                    {children}
                </main>
            </div>
        </div>
    )
}
