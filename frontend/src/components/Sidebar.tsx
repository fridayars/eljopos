import { useState } from 'react'
import { LayoutGrid, Users, Package, BarChart3, Settings, Home, Briefcase } from 'lucide-react'

interface SidebarProps {
    activeTab: string
    onTabChange: (tab: string) => void
}

const navItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'sales', icon: LayoutGrid, label: 'Kasir' },
    { id: 'product-inventory', icon: Package, label: 'Produk' },
    { id: 'service-inventory', icon: Briefcase, label: 'Layanan' },
    { id: 'customers', icon: Users, label: 'Pelanggan' },
    { id: 'reports', icon: BarChart3, label: 'Laporan' },
    { id: 'settings', icon: Settings, label: 'Pengaturan' },
]

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className="hidden lg:flex flex-col items-center py-6 gap-4 shrink-0 transition-all duration-300 ease-in-out"
                style={{
                    width: isExpanded ? '200px' : '80px',
                    background: 'rgba(10, 10, 15, 0.9)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderRight: '1px solid rgba(139, 92, 246, 0.15)',
                }}
            >
                {/* Logo — toggle expand/collapse on click */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95"
                    style={{
                        background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                        boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)',
                    }}
                    title={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
                >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </button>

                {/* Nav Items */}
                <nav className="flex-1 flex flex-col gap-2 w-full px-2">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = activeTab === item.id

                        return (
                            <button
                                key={item.id}
                                onClick={() => onTabChange(item.id)}
                                className="relative w-full rounded-xl flex items-center gap-3 transition-all duration-200 cursor-pointer overflow-hidden"
                                style={{
                                    height: '48px',
                                    padding: isExpanded ? '0 16px' : '0',
                                    justifyContent: isExpanded ? 'flex-start' : 'center',
                                    color: isActive ? '#3B82F6' : '#71717A',
                                    background: isActive
                                        ? 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))'
                                        : 'transparent',
                                    border: isActive ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
                                }}
                                onMouseEnter={(e) => {
                                    if (!isActive) e.currentTarget.style.color = '#E5E5E7'
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive) e.currentTarget.style.color = '#71717A'
                                }}
                                title={item.label}
                            >
                                {/* Active glow indicator */}
                                {isActive && (
                                    <div
                                        className="absolute left-0 top-1/2 w-0.5 h-6 rounded-r-full"
                                        style={{
                                            background: '#3B82F6',
                                            transform: 'translateY(-50%)',
                                            boxShadow: '0 0 8px rgba(59,130,246,0.8)',
                                        }}
                                    />
                                )}
                                <Icon className="w-5 h-5 relative z-10 shrink-0" />
                                <span
                                    className="text-sm relative z-10 font-medium whitespace-nowrap transition-all duration-300"
                                    style={{
                                        opacity: isExpanded ? 1 : 0,
                                        width: isExpanded ? 'auto' : 0,
                                        overflow: 'hidden',
                                    }}
                                >
                                    {item.label}
                                </span>
                            </button>
                        )
                    })}
                </nav>
            </aside>

            {/* Mobile Bottom Navigation */}
            <nav
                className="lg:hidden fixed bottom-0 left-0 right-0 h-16 z-40 overflow-x-auto"
                style={{
                    background: 'rgba(10, 10, 15, 0.95)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderTop: '1px solid rgba(139, 92, 246, 0.15)',
                }}
            >
                <div className="flex items-center justify-start h-full px-2 min-w-max">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = activeTab === item.id

                        return (
                            <button
                                key={item.id}
                                onClick={() => onTabChange(item.id)}
                                className="relative flex flex-col items-center justify-center gap-1 px-3 py-2 min-h-[44px] min-w-[64px] rounded-xl transition-all duration-200 cursor-pointer"
                                style={{
                                    color: isActive ? '#3B82F6' : '#71717A',
                                    background: isActive
                                        ? 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(139,92,246,0.12))'
                                        : 'transparent',
                                }}
                            >
                                <Icon className="w-5 h-5 relative z-10" />
                                <span className="text-[9px] relative z-10 whitespace-nowrap font-medium">{item.label}</span>
                            </button>
                        )
                    })}
                </div>
            </nav>
        </>
    )
}
