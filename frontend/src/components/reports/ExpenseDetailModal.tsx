import { useState, useEffect, useCallback } from 'react'
import { X, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { arusUangService } from '../../services/arusUangService'
import type { ArusUang } from '../../services/arusUangService'

interface ExpenseDetailModalProps {
    isOpen: boolean
    onClose: () => void
    categoryName: string
    startDate: string
    endDate: string
}

export function ExpenseDetailModal({ isOpen, onClose, categoryName, startDate, endDate }: ExpenseDetailModalProps) {
    const [data, setData] = useState<ArusUang[]>([])
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [isLoading, setIsLoading] = useState(false)

    const fetchData = useCallback(async (currentPage: number, reset: boolean = false) => {
        setIsLoading(true)
        try {
            const result = await arusUangService.getList({
                page: currentPage,
                limit: 20,
                start_date: startDate || undefined,
                end_date: endDate || undefined,
                type: 'OUT', // Expense
                search: categoryName || undefined
            })
            setData(prev => reset ? result.items : [...prev, ...result.items])
            setHasMore(result.meta.page < result.meta.total_pages)
            setPage(currentPage)
        } catch {
            // Error managed silently or can use toast
        } finally {
            setIsLoading(false)
        }
    }, [startDate, endDate, categoryName])

    useEffect(() => {
        if (isOpen && categoryName) {
            setData([])
            setPage(1)
            setHasMore(true)
            fetchData(1, true)
        }
    }, [isOpen, categoryName, fetchData])

    // Intersection Observer for Infinite Scroll
    useEffect(() => {
        if (!isOpen) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoading) {
                    fetchData(page + 1, false)
                }
            },
            { threshold: 0.1 }
        )

        const loadMoreTrigger = document.getElementById('expense-detail-load-more')
        if (loadMoreTrigger) observer.observe(loadMoreTrigger)

        return () => observer.disconnect()
    }, [hasMore, isLoading, page, fetchData, isOpen])

    const formatCurrency = (amount: number | string) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(amount))
    }

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />
                
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-5xl bg-[#1A1A24] border border-purple-500/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
                >
                    {/* Header */}
                    <div className="flex justify-between items-center p-6 border-b border-purple-500/10 shrink-0">
                        <div>
                            <h2 className="text-xl font-bold text-gray-200">Detail Pengeluaran: {categoryName}</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                {new Date(startDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })} - {new Date(endDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-200 hover:bg-white/5 rounded-xl transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content Table */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="rounded-2xl border border-white/5 overflow-hidden" style={{ background: 'var(--surface-color)' }}>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr style={{ background: 'var(--surface-subtle)', color: 'var(--muted-foreground)' }}>
                                            <th className="p-4 text-xs font-semibold whitespace-nowrap">Tanggal</th>
                                            <th className="p-4 text-xs font-semibold whitespace-nowrap">Keterangan</th>
                                            <th className="p-4 text-xs font-semibold whitespace-nowrap">Kategori</th>
                                            <th className="p-4 text-xs font-semibold whitespace-nowrap">Sumber</th>
                                            <th className="p-4 text-xs font-semibold whitespace-nowrap">Metode</th>
                                            <th className="p-4 text-xs font-semibold whitespace-nowrap text-right">Nominal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {isLoading && data.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="p-8 text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>
                                                    <div className="flex items-center justify-center gap-2 text-gray-400">
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                        Memuat data...
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : data.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="p-8 text-center text-sm text-gray-500">Tidak ada data ditemukan</td>
                                            </tr>
                                        ) : (
                                            data.map((item) => (
                                                <tr key={item.id} className="border-t border-white/5 transition-colors hover:bg-white/[0.02]">
                                                    <td className="p-4 text-sm whitespace-nowrap text-gray-300">
                                                        {new Date(item.date).toLocaleString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </td>
                                                    <td className="p-4 text-sm text-gray-300">
                                                        <div className="font-medium">{item.description || '-'}</div>
                                                        {item.creator && <div className="text-xs opacity-50 mt-1">Oleh: {item.creator.username}</div>}
                                                    </td>
                                                    <td className="p-4 text-sm">
                                                        {item.kategori ? (
                                                            <span className="px-2 py-1 rounded text-xs border border-white/10 text-gray-300" style={{ background: 'var(--surface-subtle)' }}>
                                                                {item.kategori.name}
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-gray-500 opacity-50">-</span>
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-sm">
                                                        <span className="px-2 py-1 rounded text-xs text-gray-300" style={{ background: 'var(--surface-subtle)' }}>
                                                            {item.source}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-sm">
                                                        <span className="px-2 py-1 rounded text-xs text-gray-300" style={{ background: 'var(--surface-subtle)' }}>
                                                            {item.payment_method.replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-sm text-right font-medium">
                                                        {item.type === 'IN' ? (
                                                            <span className="text-emerald-500">+ {formatCurrency(item.amount)}</span>
                                                        ) : (
                                                            <span className="text-red-500">- {formatCurrency(item.amount)}</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Infinite Scroll Trigger */}
                            <div id="expense-detail-load-more" className="h-20 flex flex-col items-center justify-center border-t border-white/5 shrink-0">
                                {isLoading && data.length > 0 && (
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span className="text-sm">Memuat lebih banyak...</span>
                                    </div>
                                )}
                                {!hasMore && data.length > 0 && (
                                    <p className="text-xs italic text-gray-500">Semua data telah dimuat</p>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
