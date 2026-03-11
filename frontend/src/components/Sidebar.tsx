import { useState, useEffect } from 'react'
import { LayoutGrid, Users, Package, BarChart3, Settings, Home, Briefcase, ChevronDown } from 'lucide-react'

interface SidebarProps {
    activeTab: string
    onTabChange: (tab: string) => void
}

interface NavItem {
    id: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon: any
    label: string
    permission?: string | string[]
    subItems?: { id: string, label: string, permission?: string | string[] }[]
}

const navItems: NavItem[] = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'sales', icon: LayoutGrid, label: 'Kasir', permission: 'casier' },
    { id: 'products', icon: Package, label: 'Produk', permission: 'product.view' },
    { id: 'services', icon: Briefcase, label: 'Layanan', permission: 'service.view' },
    { id: 'customers', icon: Users, label: 'Pelanggan' },
    { id: 'reports', icon: BarChart3, label: 'Laporan', permission: ['report.general', 'report.finance', 'report.transaction'] },
    { 
        id: 'settings', 
        icon: Settings, 
        label: 'Pengaturan',
        subItems: [
            { id: 'settings/users', label: 'User', permission: 'user.view' },
            { id: 'settings/role', label: 'Role', permission: 'role.view' }
        ]
    },
]

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
        settings: activeTab.startsWith('settings')
    })
    const [mobileSubmenu, setMobileSubmenu] = useState<NavItem | null>(null)
    const [userPermissions] = useState<string[]>(() => {
        try {
            const token = localStorage.getItem('token')
            if (token) {
                const payload = JSON.parse(atob(token.split('.')[1]))
                return payload.permissions || []
            }
        } catch {
            console.error('Failed to parse token permissions')
        }
        return []
    })

    // Keep menu open if active tab changes to something inside it
    useEffect(() => {
        if (activeTab.startsWith('settings')) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setOpenMenus(prev => ({ ...prev, settings: true }))
        }
    }, [activeTab])

    const filteredNavItems = navItems.map(item => {
        if (item.permission) {
            const hasPermission = Array.isArray(item.permission)
                ? item.permission.some(p => userPermissions.includes(p))
                : userPermissions.includes(item.permission)
            if (!hasPermission) return null
        }
        
        if (item.subItems) {
            const filteredSubItems = item.subItems.filter(sub => {
                if (!sub.permission) return true
                return Array.isArray(sub.permission)
                    ? sub.permission.some(p => userPermissions.includes(p))
                    : userPermissions.includes(sub.permission)
            })
            
            if (filteredSubItems.length === 0) return null
            
            return { ...item, subItems: filteredSubItems }
        }
        
        return item
    }).filter(Boolean) as NavItem[]

    const handleMenuClick = (item: NavItem) => {
        if (item.subItems) {
            if (!isExpanded) setIsExpanded(true)
            setOpenMenus(prev => ({ ...prev, [item.id]: !prev[item.id] }))
        } else {
            onTabChange(item.id)
        }
    }

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className="hidden lg:flex flex-col items-center py-6 gap-4 shrink-0 transition-all duration-300 ease-in-out"
                style={{
                    width: isExpanded ? '200px' : '80px',
                    background: 'var(--surface-overlay)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderRight: '1px solid var(--border-subtle)',
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
                    {filteredNavItems.map((item) => {
                        const Icon = item.icon
                        const isActive = item.subItems 
                            ? activeTab.startsWith(item.id) 
                            : activeTab === item.id
                        const isOpen = openMenus[item.id]

                        return (
                            <div key={item.id} className="w-full flex flex-col gap-1">
                                <button
                                    onClick={() => handleMenuClick(item)}
                                    className="relative w-full rounded-xl flex items-center justify-between gap-3 transition-all duration-200 cursor-pointer overflow-hidden"
                                    style={{
                                        height: '48px',
                                        padding: isExpanded ? '0 16px' : '0',
                                        justifyContent: 'center',
                                        color: isActive ? '#3B82F6' : '#71717A',
                                        background: isActive && !item.subItems
                                            ? 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))'
                                            : isActive && item.subItems
                                            ? 'rgba(59,130,246,0.05)'
                                            : 'transparent',
                                        border: isActive && !item.subItems ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isActive) e.currentTarget.style.color = 'var(--foreground)'
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive) e.currentTarget.style.color = 'var(--muted-foreground)'
                                    }}
                                    title={!isExpanded ? item.label : undefined}
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
                                    <div className="flex items-center gap-3 w-full" style={{ justifyContent: isExpanded ? 'flex-start' : 'center' }}>
                                        <Icon className="w-5 h-5 relative z-10 shrink-0" />
                                        <span
                                            className="text-sm relative z-10 font-medium whitespace-nowrap transition-all duration-300"
                                            style={{
                                                opacity: isExpanded ? 1 : 0,
                                                width: isExpanded ? 'auto' : 0,
                                                overflow: 'hidden',
                                                visibility: isExpanded ? 'visible' : 'hidden'
                                            }}
                                        >
                                            {item.label}
                                        </span>
                                    </div>
                                    
                                    {isExpanded && item.subItems && (
                                        <ChevronDown 
                                            className="w-4 h-4 shrink-0 transition-transform duration-300"
                                            style={{ 
                                                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                                color: isActive ? '#3B82F6' : '#71717A'
                                            }} 
                                        />
                                    )}
                                </button>

                                {/* Sub Items Dropdown */}
                                {isExpanded && item.subItems && (
                                    <div 
                                        className="flex flex-col overflow-hidden transition-all duration-300 ease-in-out"
                                        style={{
                                            maxHeight: isOpen ? `${item.subItems.length * 40}px` : '0px',
                                            opacity: isOpen ? 1 : 0,
                                            marginTop: isOpen ? '4px' : '0'
                                        }}
                                    >
                                        {item.subItems.map(sub => {
                                            const isSubActive = activeTab === sub.id
                                            return (
                                                <button
                                                    key={sub.id}
                                                    onClick={() => onTabChange(sub.id)}
                                                    className="w-full text-left rounded-lg text-sm transition-colors duration-200 cursor-pointer"
                                                    style={{
                                                        padding: '8px 16px 8px 48px',
                                                        color: isSubActive ? '#3B82F6' : '#71717A',
                                                        background: isSubActive ? 'rgba(59,130,246,0.1)' : 'transparent',
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (!isSubActive) e.currentTarget.style.color = 'var(--foreground)'
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (!isSubActive) e.currentTarget.style.color = 'var(--muted-foreground)'
                                                    }}
                                                >
                                                    {sub.label}
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </nav>
            </aside>

            {/* Mobile Bottom Navigation */}
            <nav
                className="lg:hidden fixed bottom-0 left-0 right-0 h-16 z-40 overflow-x-auto"
                style={{
                    background: 'var(--surface-overlay)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderTop: '1px solid var(--border-subtle)',
                }}
            >
                <div className="flex items-center justify-start h-full px-2 min-w-max">
                    {filteredNavItems.map((item) => {
                        const Icon = item.icon
                        const isActive = item.subItems 
                            ? activeTab.startsWith(item.id) 
                            : activeTab === item.id

                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    if (item.subItems) {
                                        setMobileSubmenu(prev => prev?.id === item.id ? null : item)
                                    } else {
                                        onTabChange(item.id)
                                        setMobileSubmenu(null)
                                    }
                                }}
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

            {/* Mobile Submenu Sheet */}
            {mobileSubmenu && (
                <>
                    {/* Overlay */}
                    <div
                        className="lg:hidden fixed inset-0 z-30"
                        onClick={() => setMobileSubmenu(null)}
                    />
                    {/* Popup */}
                    <div
                        className="lg:hidden fixed bottom-16 left-1/2 z-40 rounded-2xl overflow-hidden"
                        style={{
                            transform: 'translateX(-50%)',
                            minWidth: '200px',
                            background: 'var(--surface-overlay)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            border: '1px solid var(--border-subtle)',
                            boxShadow: '0 -4px 32px rgba(0,0,0,0.3)',
                            animation: 'slideUp 0.2s ease-out',
                        }}
                    >
                        <div
                            className="px-4 py-2.5"
                            style={{ borderBottom: '1px solid var(--border-subtle)' }}
                        >
                            <p className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>
                                {mobileSubmenu.label}
                            </p>
                        </div>
                        <div className="p-2 flex flex-col gap-1">
                            {mobileSubmenu.subItems!.map(sub => {
                                const isSubActive = activeTab === sub.id
                                return (
                                    <button
                                        key={sub.id}
                                        onClick={() => {
                                            onTabChange(sub.id)
                                            setMobileSubmenu(null)
                                        }}
                                        className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer"
                                        style={{
                                            color: isSubActive ? '#3B82F6' : 'var(--foreground)',
                                            background: isSubActive
                                                ? 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))'
                                                : 'transparent',
                                        }}
                                    >
                                        {sub.label}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </>
            )}

            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateX(-50%) translateY(12px); }
                    to { opacity: 1; transform: translateX(-50%) translateY(0); }
                }
            `}</style>
        </>
    )
}
