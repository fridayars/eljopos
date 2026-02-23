import { useState, useEffect, useRef } from 'react'
import { getStores, login } from '../services/authService'
import type { Store } from '../services/authService'

const LoginPage = () => {
    // ---------- State ----------
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [storeId, setStoreId] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [stores, setStores] = useState<Store[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingStores, setIsLoadingStores] = useState(true)
    const [errorMessage, setErrorMessage] = useState('')
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // ---------- Click Outside Handler ----------
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // ---------- Load stores on mount ----------
    useEffect(() => {
        const fetchStores = async () => {
            try {
                const res = await getStores()
                if (res.success && res.data) {
                    setStores(res.data)
                }
            } catch {
                console.error('Failed to load stores')
            } finally {
                setIsLoadingStores(false)
            }
        }
        fetchStores()
    }, [])

    // ---------- Handle Login ----------
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrorMessage('')

        // Client-side validation
        if (!username.trim()) {
            setErrorMessage('Username wajib diisi')
            return
        }
        if (!password.trim()) {
            setErrorMessage('Password wajib diisi')
            return
        }
        if (!storeId) {
            setErrorMessage('Silakan pilih store')
            return
        }

        setIsLoading(true)

        try {
            const res = await login({ username, password, store_id: storeId })

            if (res.success && res.data) {
                // Simpan token (TODO: integrasikan dengan auth state management)
                localStorage.setItem('token', res.data.token)
                localStorage.setItem('user', JSON.stringify(res.data.user))
                console.log('Login berhasil:', res.data)
                // TODO: redirect ke dashboard
            } else {
                setErrorMessage(res.message || 'Login gagal')
            }
        } catch {
            setErrorMessage('Terjadi kesalahan jaringan. Coba lagi.')
        } finally {
            setIsLoading(false)
        }
    }

    // ---------- Render ----------
    return (
        <div
            className="min-h-screen flex items-center justify-center px-4 py-8"
            style={{
                background: 'linear-gradient(135deg, #0F0F14 0%, #1a1025 40%, #0F0F14 100%)',
            }}
        >
            {/* Decorative glow orbs */}
            <div
                className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none opacity-20 blur-[120px]"
                style={{ background: '#3B82F6' }}
            />
            <div
                className="fixed bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none opacity-15 blur-[120px]"
                style={{ background: '#8B5CF6' }}
            />

            {/* Login Card */}
            <div
                className="relative w-full max-w-md z-10"
                style={{
                    background: 'rgba(26, 26, 31, 0.8)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    borderRadius: 'var(--radius)',
                    border: '1px solid rgba(139, 92, 246, 0.15)',
                    boxShadow: '0 0 60px rgba(59, 130, 246, 0.08), 0 25px 50px rgba(0, 0, 0, 0.4)',
                }}
            >
                {/* Top gradient line */}
                <div
                    className="absolute top-0 left-[10%] right-[10%] h-[2px] rounded-full"
                    style={{
                        background: 'linear-gradient(90deg, transparent, #3B82F6, #8B5CF6, transparent)',
                    }}
                />

                <div className="p-8 sm:p-12 my-2 sm:my-0">
                    {/* Branding */}
                    <div className="text-center mb-10">
                        <div
                            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
                            style={{
                                background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                                boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)',
                            }}
                        >
                            <svg
                                className="w-8 h-8 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                strokeWidth="2"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                />
                            </svg>
                        </div>
                        <h1
                            className="text-2xl font-semibold tracking-tight"
                            style={{ color: 'var(--foreground)' }}
                        >
                            eljoPOS
                        </h1>
                        <p className="text-sm mt-1.5" style={{ color: 'var(--muted-foreground)' }}>
                            Store Service Management & POS
                        </p>
                    </div>

                    {/* Error Alert */}
                    {errorMessage && (
                        <div
                            id="login-error-alert"
                            className="relative flex items-start gap-3 p-4 pr-10 rounded-lg mb-6 animate-[fadeShake_0.4s_ease-out]"
                            style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                            }}
                        >
                            <svg
                                className="w-5 h-5 mt-0.5 shrink-0"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="#EF4444"
                                strokeWidth="2"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                                />
                            </svg>
                            <div>
                                <p
                                    className="text-sm font-medium"
                                    style={{ color: '#EF4444' }}
                                >
                                    Login Gagal
                                </p>
                                <p
                                    className="text-sm mt-0.5"
                                    style={{ color: 'rgba(239, 68, 68, 0.8)' }}
                                >
                                    {errorMessage}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setErrorMessage('')}
                                className="absolute top-3 right-3 shrink-0 p-1 rounded-md transition-colors cursor-pointer"
                                style={{ color: 'rgba(239, 68, 68, 0.6)' }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
                                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(239, 68, 68, 0.6)')}
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Username */}
                        <div>
                            <label
                                htmlFor="username"
                                className="block text-sm font-medium mb-2"
                                style={{ color: 'var(--foreground)' }}
                            >
                                Username
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <svg
                                        className="w-[18px] h-[18px]"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="var(--muted-foreground)"
                                        strokeWidth="1.5"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                                        />
                                    </svg>
                                </div>
                                <input
                                    id="username"
                                    type="text"
                                    placeholder="Masukkan username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-14 pr-4 py-3 rounded-lg text-sm outline-none transition-all duration-200"
                                    style={{
                                        background: 'var(--input-background)',
                                        border: '1px solid var(--input)',
                                        color: 'var(--foreground)'
                                    }}
                                    onFocus={(e) => {
                                        e.currentTarget.style.borderColor = 'var(--primary)'
                                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.15)'
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.borderColor = 'var(--input)'
                                        e.currentTarget.style.boxShadow = 'none'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium mb-2"
                                style={{ color: 'var(--foreground)' }}
                            >
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <svg
                                        className="w-[18px] h-[18px]"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="var(--muted-foreground)"
                                        strokeWidth="1.5"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                                        />
                                    </svg>
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Masukkan password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-14 pr-12 py-3 rounded-lg text-sm outline-none transition-all duration-200"
                                    style={{
                                        background: 'var(--input-background)',
                                        border: '1px solid var(--input)',
                                        color: 'var(--foreground)'
                                    }}
                                    onFocus={(e) => {
                                        e.currentTarget.style.borderColor = 'var(--primary)'
                                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.15)'
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.borderColor = 'var(--input)'
                                        e.currentTarget.style.boxShadow = 'none'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 rounded transition-colors cursor-pointer"
                                    style={{ color: 'var(--muted-foreground)' }}
                                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--foreground)')}
                                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted-foreground)')}
                                >
                                    {showPassword ? (
                                        <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                        </svg>
                                    ) : (
                                        <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Store Dropdown */}
                        <div>
                            <label
                                htmlFor="store"
                                className="block text-sm font-medium mb-2"
                                style={{ color: 'var(--foreground)' }}
                            >
                                Pilih Store
                            </label>
                            <div className="relative" ref={dropdownRef}>
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                                    <svg
                                        className="w-[18px] h-[18px]"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="var(--muted-foreground)"
                                        strokeWidth="1.5"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z"
                                        />
                                    </svg>
                                </div>

                                {/* Custom Select Trigger */}
                                <div
                                    onClick={() => !isLoadingStores && setIsDropdownOpen(!isDropdownOpen)}
                                    className="w-full pl-14 pr-10 py-3 rounded-lg text-sm transition-all duration-200 cursor-pointer flex items-center outline-none select-none"
                                    style={{
                                        background: 'var(--input-background)',
                                        border: '1px solid var(--input)',
                                        color: storeId ? 'var(--foreground)' : 'var(--muted-foreground)',
                                        minHeight: '46px',
                                        borderColor: isDropdownOpen ? 'var(--primary)' : 'var(--input)',
                                        boxShadow: isDropdownOpen ? '0 0 0 3px rgba(59, 130, 246, 0.15)' : 'none'
                                    }}
                                >
                                    {isLoadingStores
                                        ? 'Memuat store...'
                                        : (storeId ? stores.find(s => s.id === storeId)?.name : 'Pilih store...')
                                    }
                                </div>

                                {/* Custom dropdown arrow */}
                                <div
                                    className="absolute right-3.5 top-1/2 pointer-events-none z-10 transition-transform duration-200"
                                    style={{
                                        transform: isDropdownOpen ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%)'
                                    }}
                                >
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="var(--muted-foreground)"
                                        strokeWidth="2"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                    </svg>
                                </div>

                                {/* Dropdown Menu */}
                                {isDropdownOpen && !isLoadingStores && (
                                    <div
                                        className="absolute left-0 right-0 mt-2 py-1 rounded-lg z-50 overflow-hidden shadow-2xl animate-[fadeIn_0.15s_ease-out]"
                                        style={{
                                            background: '#1A1A1F',
                                            border: '1px solid rgba(139, 92, 246, 0.2)',
                                        }}
                                    >
                                        <ul className="max-h-60 overflow-y-auto">
                                            {stores.map((store) => (
                                                <li
                                                    key={store.id}
                                                    className="px-4 py-3 pl-14 text-sm cursor-pointer transition-colors flex items-center"
                                                    style={{
                                                        color: storeId === store.id ? '#3B82F6' : '#E5E5E7',
                                                        background: storeId === store.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
                                                    }}
                                                    onClick={() => {
                                                        setStoreId(store.id)
                                                        setIsDropdownOpen(false)
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (storeId !== store.id) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (storeId !== store.id) e.currentTarget.style.background = 'transparent'
                                                    }}
                                                >
                                                    {store.name}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Login Button */}
                        <button
                            id="login-button"
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                            style={{
                                background: isLoading
                                    ? 'rgba(59, 130, 246, 0.5)'
                                    : 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                                color: '#ffffff',
                                boxShadow: isLoading
                                    ? 'none'
                                    : '0 4px 20px rgba(59, 130, 246, 0.3)',
                            }}
                            onMouseEnter={(e) => {
                                if (!isLoading) {
                                    e.currentTarget.style.boxShadow = '0 6px 30px rgba(59, 130, 246, 0.45)'
                                    e.currentTarget.style.transform = 'translateY(-1px)'
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isLoading) {
                                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(59, 130, 246, 0.3)'
                                    e.currentTarget.style.transform = 'translateY(0)'
                                }
                            }}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg
                                        className="w-4 h-4 animate-spin"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    Memproses...
                                </span>
                            ) : (
                                'Masuk'
                            )}
                        </button>
                    </form>

                    {/* Footer hint */}
                    <p
                        className="text-xs text-center mt-6"
                        style={{ color: 'var(--muted-foreground)' }}
                    >
                        Mock login: <span style={{ color: 'var(--accent)' }}>admin</span> /{' '}
                        <span style={{ color: 'var(--accent)' }}>admin123</span>
                    </p>
                </div>
            </div>

            {/* Shake animation for error */}
            <style>{`
        @keyframes fadeShake {
          0% { opacity: 0; transform: translateX(-8px); }
          25% { transform: translateX(6px); }
          50% { transform: translateX(-4px); opacity: 1; }
          75% { transform: translateX(2px); }
          100% { transform: translateX(0); opacity: 1; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    )
}

export default LoginPage
