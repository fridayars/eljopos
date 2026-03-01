import { useState, useEffect } from 'react'
import { DollarSign, ShoppingCart, Users, Package, Clock, Edit3, Save, StickyNote, TrendingUp, TrendingDown } from 'lucide-react'
import { getDashboardSummary, getRecentTransactions } from '../services/dashboardService'
import type { DashboardSummary, RecentTransaction } from '../services/dashboardService'

function formatRupiah(amount: number): string {
    return 'Rp ' + amount.toLocaleString('id-ID')
}

function formatTime(iso: string): string {
    const date = new Date(iso)
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

export function DashboardPage() {
    const [summary, setSummary] = useState<DashboardSummary | null>(null)
    const [transactions, setTransactions] = useState<RecentTransaction[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const [notes, setNotes] = useState(
        '• Follow up supplier untuk item stok menipis\n• Jadwal rapat staff besok pagi\n• Review harga promosi untuk akhir pekan',
    )
    const [isEditingNotes, setIsEditingNotes] = useState(false)
    const [tempNotes, setTempNotes] = useState(notes)

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            try {
                const [summaryRes, txRes] = await Promise.all([
                    getDashboardSummary(),
                    getRecentTransactions(),
                ])
                if (summaryRes.success && summaryRes.data) setSummary(summaryRes.data)
                if (txRes.success && txRes.data) setTransactions(txRes.data)
            } catch {
                console.error('Gagal memuat data dashboard')
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [])

    const stats = summary
        ? [
            {
                id: 1,
                label: 'Penjualan Hari Ini',
                value: formatRupiah(summary.today_sales),
                change: summary.sales_change,
                trend: summary.sales_change.startsWith('+') ? 'up' : 'down',
                icon: DollarSign,
                colorFrom: 'rgba(59,130,246,0.2)',
                colorTo: 'rgba(59,130,246,0.1)',
                borderColor: 'rgba(59,130,246,0.3)',
                iconColor: '#60A5FA',
            },
            {
                id: 2,
                label: 'Total Transaksi',
                value: String(summary.total_transactions),
                change: summary.transactions_change,
                trend: summary.transactions_change.startsWith('+') ? 'up' : 'down',
                icon: ShoppingCart,
                colorFrom: 'rgba(139,92,246,0.2)',
                colorTo: 'rgba(139,92,246,0.1)',
                borderColor: 'rgba(139,92,246,0.3)',
                iconColor: '#A78BFA',
            },
            {
                id: 3,
                label: 'Pelanggan Hari Ini',
                value: String(summary.total_customers),
                change: summary.customers_change,
                trend: summary.customers_change.startsWith('+') ? 'up' : 'down',
                icon: Users,
                colorFrom: 'rgba(6,182,212,0.2)',
                colorTo: 'rgba(6,182,212,0.1)',
                borderColor: 'rgba(6,182,212,0.3)',
                iconColor: '#22D3EE',
            },
            {
                id: 4,
                label: 'Item Stok Kritis',
                value: String(summary.low_stock_items),
                change: summary.low_stock_change,
                trend: summary.low_stock_change.startsWith('-') ? 'down' : 'up',
                icon: Package,
                colorFrom: 'rgba(249,115,22,0.2)',
                colorTo: 'rgba(249,115,22,0.1)',
                borderColor: 'rgba(249,115,22,0.3)',
                iconColor: '#FB923C',
            },
        ]
        : []

    return (
        <div className="flex-1 overflow-auto pb-20 lg:pb-0">
            <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-[1400px]">

                {/* Header */}
                <div>
                    <h1
                        className="text-2xl md:text-3xl font-semibold"
                        style={{ color: 'var(--foreground)' }}
                    >
                        Dashboard
                    </h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
                        Ringkasan aktivitas toko hari ini
                    </p>
                </div>

                {/* Stats Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="rounded-xl p-5 animate-pulse"
                                style={{
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(139,92,246,0.15)',
                                    height: '120px',
                                }}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {stats.map((stat) => {
                            const Icon = stat.icon
                            const isUp = stat.trend === 'up'
                            return (
                                <div
                                    key={stat.id}
                                    className="rounded-xl p-4 md:p-5 transition-all duration-200"
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.04)',
                                        border: '1px solid rgba(139, 92, 246, 0.15)',
                                        backdropFilter: 'blur(12px)',
                                        WebkitBackdropFilter: 'blur(12px)',
                                    }}
                                    onMouseEnter={(e) => {
                                        ; (e.currentTarget as HTMLDivElement).style.border = `1px solid ${stat.borderColor}`
                                            ; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 4px 20px ${stat.colorTo}`
                                    }}
                                    onMouseLeave={(e) => {
                                        ; (e.currentTarget as HTMLDivElement).style.border = '1px solid rgba(139, 92, 246, 0.15)'
                                            ; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
                                    }}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div
                                            className="w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center"
                                            style={{
                                                background: `linear-gradient(135deg, ${stat.colorFrom}, ${stat.colorTo})`,
                                                border: `1px solid ${stat.borderColor}`,
                                            }}
                                        >
                                            <Icon className="w-5 h-5 md:w-6 md:h-6" style={{ color: stat.iconColor }} />
                                        </div>
                                        <div
                                            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                                            style={{
                                                color: isUp ? '#4ADE80' : '#FB923C',
                                                background: isUp ? 'rgba(74,222,128,0.1)' : 'rgba(251,146,60,0.1)',
                                            }}
                                        >
                                            {isUp ? (
                                                <TrendingUp className="w-3 h-3" />
                                            ) : (
                                                <TrendingDown className="w-3 h-3" />
                                            )}
                                            {stat.change}
                                        </div>
                                    </div>
                                    <p className="text-xs md:text-sm mb-1" style={{ color: 'var(--muted-foreground)' }}>
                                        {stat.label}
                                    </p>
                                    <p className="text-xl md:text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>
                                        {stat.value}
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Two Column Layout */}
                <div className="grid lg:grid-cols-2 gap-6">

                    {/* Recent Transactions */}
                    <div
                        className="rounded-xl overflow-hidden"
                        style={{
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(139, 92, 246, 0.15)',
                            backdropFilter: 'blur(12px)',
                            WebkitBackdropFilter: 'blur(12px)',
                        }}
                    >
                        <div
                            className="px-5 py-4 flex items-center gap-2"
                            style={{ borderBottom: '1px solid rgba(139, 92, 246, 0.15)' }}
                        >
                            <Clock className="w-5 h-5" style={{ color: '#60A5FA' }} />
                            <h3 className="text-base font-medium" style={{ color: 'var(--foreground)' }}>
                                Transaksi Terbaru
                            </h3>
                        </div>

                        {isLoading ? (
                            <div className="p-5 space-y-3">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div
                                        key={i}
                                        className="rounded-lg h-14 animate-pulse"
                                        style={{ background: 'rgba(255,255,255,0.05)' }}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div>
                                {transactions.map((tx, idx) => (
                                    <div
                                        key={tx.invoice_number}
                                        className="px-5 py-4 transition-colors duration-150"
                                        style={{
                                            borderTop: idx > 0 ? '1px solid rgba(139, 92, 246, 0.08)' : 'none',
                                        }}
                                        onMouseEnter={(e) => {
                                            ; (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)'
                                        }}
                                        onMouseLeave={(e) => {
                                            ; (e.currentTarget as HTMLDivElement).style.background = 'transparent'
                                        }}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                                                {tx.customer_name}
                                            </p>
                                            <p className="text-sm font-semibold" style={{ color: '#60A5FA' }}>
                                                {formatRupiah(tx.total_amount)}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="text-xs px-2 py-0.5 rounded-full"
                                                    style={{
                                                        color: tx.payment_method === 'CASH' ? '#4ADE80' : '#A78BFA',
                                                        background:
                                                            tx.payment_method === 'CASH'
                                                                ? 'rgba(74,222,128,0.1)'
                                                                : 'rgba(167,139,250,0.1)',
                                                    }}
                                                >
                                                    {tx.payment_method}
                                                </span>
                                                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                                    {tx.items_count} item
                                                </span>
                                            </div>
                                            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                                {formatTime(tx.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Notes */}
                    <div
                        className="rounded-xl overflow-hidden"
                        style={{
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(139, 92, 246, 0.15)',
                            backdropFilter: 'blur(12px)',
                            WebkitBackdropFilter: 'blur(12px)',
                        }}
                    >
                        <div
                            className="px-5 py-4 flex items-center justify-between"
                            style={{ borderBottom: '1px solid rgba(139, 92, 246, 0.15)' }}
                        >
                            <div className="flex items-center gap-2">
                                <StickyNote className="w-5 h-5" style={{ color: '#22D3EE' }} />
                                <h3 className="text-base font-medium" style={{ color: 'var(--foreground)' }}>
                                    Catatan
                                </h3>
                            </div>
                            {!isEditingNotes && (
                                <button
                                    onClick={() => {
                                        setTempNotes(notes)
                                        setIsEditingNotes(true)
                                    }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-150 cursor-pointer"
                                    style={{
                                        color: 'var(--muted-foreground)',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(139,92,246,0.2)',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.color = '#60A5FA'
                                        e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)'
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.color = 'var(--muted-foreground)'
                                        e.currentTarget.style.borderColor = 'rgba(139,92,246,0.2)'
                                    }}
                                >
                                    <Edit3 className="w-3.5 h-3.5" />
                                    <span className="hidden md:inline">Edit</span>
                                </button>
                            )}
                        </div>

                        <div className="p-5">
                            {isEditingNotes ? (
                                <>
                                    <textarea
                                        value={tempNotes}
                                        onChange={(e) => setTempNotes(e.target.value)}
                                        className="w-full resize-none rounded-xl p-4 text-sm outline-none transition-all duration-200"
                                        style={{
                                            minHeight: '220px',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(139,92,246,0.2)',
                                            color: 'var(--foreground)',
                                        }}
                                        onFocus={(e) => {
                                            e.currentTarget.style.borderColor = '#3B82F6'
                                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'
                                        }}
                                        onBlur={(e) => {
                                            e.currentTarget.style.borderColor = 'rgba(139,92,246,0.2)'
                                            e.currentTarget.style.boxShadow = 'none'
                                        }}
                                        placeholder="Tambahkan catatan di sini..."
                                    />
                                    <div className="mt-3 flex items-center gap-2">
                                        <button
                                            onClick={() => {
                                                setNotes(tempNotes)
                                                setIsEditingNotes(false)
                                            }}
                                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-white font-medium transition-all duration-150 cursor-pointer"
                                            style={{
                                                background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                                                boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(59,130,246,0.45)'
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59,130,246,0.3)'
                                            }}
                                        >
                                            <Save className="w-3.5 h-3.5" />
                                            Simpan
                                        </button>
                                        <button
                                            onClick={() => setIsEditingNotes(false)}
                                            className="px-4 py-2 rounded-lg text-sm transition-all duration-150 cursor-pointer"
                                            style={{
                                                color: 'var(--muted-foreground)',
                                                border: '1px solid rgba(139,92,246,0.25)',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.color = 'var(--foreground)'
                                                e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)'
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.color = 'var(--muted-foreground)'
                                                e.currentTarget.style.borderColor = 'rgba(139,92,246,0.25)'
                                            }}
                                        >
                                            Batal
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div
                                    className="text-sm whitespace-pre-line leading-relaxed"
                                    style={{
                                        color: 'var(--foreground)',
                                        minHeight: '220px',
                                    }}
                                >
                                    {notes || (
                                        <span style={{ color: 'var(--muted-foreground)', fontStyle: 'italic' }}>
                                            Belum ada catatan. Klik Edit untuk menambahkan.
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
