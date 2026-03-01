import { Bell, ChevronDown, Store, LogOut, User } from 'lucide-react'
import { useState, useEffect } from 'react'

interface TopBarProps {
    onLogout: () => void
}

interface StoredUser {
    id: string
    username: string
    role: string
    store_id: string
}

export function TopBar({ onLogout }: TopBarProps) {
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
    const [user, setUser] = useState<StoredUser | null>(null)
    const [storeName, setStoreName] = useState<string>('')

    useEffect(() => {
        // Load user from localStorage
        const userRaw = localStorage.getItem('user')
        if (userRaw) {
            try {
                setUser(JSON.parse(userRaw))
            } catch {
                // ignore
            }
        }

        // Load store name from localStorage (saved during login)
        const storeNameRaw = localStorage.getItem('store_name')
        if (storeNameRaw) setStoreName(storeNameRaw)
    }, [])

    const initials = user?.username
        ? user.username.slice(0, 2).toUpperCase()
        : 'AU'

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('store_name')
        setIsUserDropdownOpen(false)
        onLogout()
    }

    return (
        <header
            className="h-16 md:h-[72px] flex items-center justify-between px-4 md:px-8 shrink-0 relative z-50"
            style={{
                background: 'rgba(26, 26, 31, 0.8)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(139, 92, 246, 0.15)',
            }}
        >
            {/* Left — App branding (mobile only, desktop sidebar handles logo) */}
            <div className="flex items-center gap-3">
                <div className="lg:hidden flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{
                            background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                            boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)',
                        }}
                    >
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <div className="hidden sm:block">
                        <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>eljoPOS</p>
                        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Store Management</p>
                    </div>
                </div>

                {/* Page greeting — desktop */}
                <div className="hidden lg:block">
                    <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        Selamat datang kembali,{' '}
                        <span style={{ color: 'var(--foreground)', fontWeight: 500 }}>
                            {user?.username || 'User'}
                        </span>
                    </p>
                </div>
            </div>

            {/* Right — Actions */}
            <div className="flex items-center gap-2 md:gap-3">

                {/* Notifications */}
                <button
                    className="relative w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer"
                    style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(139, 92, 246, 0.2)',
                        color: '#71717A',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#E5E5E7')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#71717A')}
                >
                    <Bell className="w-5 h-5" />
                    <span
                        className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                        style={{
                            background: '#EF4444',
                            boxShadow: '0 0 6px rgba(239, 68, 68, 0.8)',
                        }}
                    />
                </button>

                {/* Store info */}
                {storeName && (
                    <div
                        className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl"
                        style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(139, 92, 246, 0.2)',
                        }}
                    >
                        <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center"
                            style={{
                                background: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(236,72,153,0.25))',
                                border: '1px solid rgba(139,92,246,0.3)',
                            }}
                        >
                            <Store className="w-4 h-4" style={{ color: '#A78BFA' }} />
                        </div>
                        <div className="text-left max-w-[140px]">
                            <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>Store</p>
                            <p className="text-xs font-medium truncate" style={{ color: 'var(--foreground)' }}>{storeName}</p>
                        </div>
                    </div>
                )}

                {/* Divider */}
                <div
                    className="hidden md:block h-8 w-px"
                    style={{ background: 'rgba(139, 92, 246, 0.2)' }}
                />

                {/* User Profile Dropdown */}
                <div className="relative">
                    <button
                        id="topbar-user-btn"
                        onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all duration-200 cursor-pointer"
                        style={{
                            background: isUserDropdownOpen ? 'rgba(255,255,255,0.08)' : 'transparent',
                            border: '1px solid transparent',
                        }}
                        onMouseEnter={(e) => {
                            if (!isUserDropdownOpen) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                        }}
                        onMouseLeave={(e) => {
                            if (!isUserDropdownOpen) e.currentTarget.style.background = 'transparent'
                        }}
                    >
                        {/* Avatar */}
                        <div
                            className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-white text-sm font-semibold"
                            style={{
                                background: 'linear-gradient(135deg, #06B6D4, #3B82F6)',
                                boxShadow: '0 0 12px rgba(6, 182, 212, 0.3)',
                            }}
                        >
                            {initials}
                        </div>
                        <div className="hidden lg:block text-left">
                            <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                                {user?.username || 'User'}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                {user?.role || 'Staff'}
                            </p>
                        </div>
                        <ChevronDown
                            className="hidden lg:block w-4 h-4 transition-transform duration-200"
                            style={{
                                color: 'var(--muted-foreground)',
                                transform: isUserDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                            }}
                        />
                    </button>

                    {/* Dropdown Menu */}
                    {isUserDropdownOpen && (
                        <>
                            {/* Overlay to close */}
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setIsUserDropdownOpen(false)}
                            />
                            <div
                                id="topbar-user-dropdown"
                                className="absolute top-full right-0 mt-2 w-52 rounded-xl overflow-hidden z-50"
                                style={{
                                    background: 'rgba(18, 18, 24, 0.97)',
                                    backdropFilter: 'blur(20px)',
                                    WebkitBackdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(139, 92, 246, 0.25)',
                                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(139,92,246,0.1)',
                                    animation: 'fadeInDown 0.15s ease-out',
                                }}
                            >
                                {/* User info header */}
                                <div
                                    className="px-4 py-3"
                                    style={{ borderBottom: '1px solid rgba(139, 92, 246, 0.15)' }}
                                >
                                    <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                                        {user?.username || 'User'}
                                    </p>
                                    <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                                        {user?.role || 'Staff'}
                                    </p>
                                </div>

                                <div className="p-1.5">
                                    <button
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150 cursor-pointer text-left"
                                        style={{ color: 'var(--muted-foreground)' }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                                            e.currentTarget.style.color = 'var(--foreground)'
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'transparent'
                                            e.currentTarget.style.color = 'var(--muted-foreground)'
                                        }}
                                        onClick={() => setIsUserDropdownOpen(false)}
                                    >
                                        <User className="w-4 h-4 shrink-0" />
                                        <span className="text-sm">Profil Saya</span>
                                    </button>

                                    <div
                                        className="my-1 mx-1 h-px"
                                        style={{ background: 'rgba(139, 92, 246, 0.15)' }}
                                    />

                                    <button
                                        id="logout-btn"
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150 cursor-pointer text-left"
                                        style={{ color: '#EF4444' }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'transparent'
                                        }}
                                        onClick={handleLogout}
                                    >
                                        <LogOut className="w-4 h-4 shrink-0" />
                                        <span className="text-sm font-medium">Keluar</span>
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes fadeInDown {
                    from { opacity: 0; transform: translateY(-8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </header>
    )
}
