import { useState, useEffect, useCallback, useRef } from 'react'
import { Search, XCircle, Wrench, Upload, Trash2, X, Image as ImageIcon, Loader2, BadgeDollarSign, ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'motion/react'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { getTeknisiTransactions, getTeknisiTransactionDetail, getTeknisiInsentifTotal, uploadTeknisiImage, deleteTeknisiImage } from '../services/teknisiService'
import type { TeknisiTransaction, TeknisiTransactionDetailResponse } from '../services/teknisiService'
import { DateRangePicker } from '../components/ui/DateRangePicker'

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)

export function TeknisiPage() {
    const userStr = localStorage.getItem('user')
    const userRole = userStr ? JSON.parse(userStr).role : ''
    const permissions = userStr ? JSON.parse(userStr).permissions || [] : []
    const isAdministrator = userRole?.toLowerCase() === 'administrator'
    const canViewInsentif = isAdministrator || permissions.includes('teknisi.view_insentif')

    // Date range state — default to today
    const getToday = () => {
        const now = new Date()
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    }
    const [startDate, setStartDate] = useState(getToday)
    const [endDate, setEndDate] = useState(getToday)

    // Data States
    const [transactions, setTransactions] = useState<TeknisiTransaction[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isFetchingMore, setIsFetchingMore] = useState(false)
    const [hasMore, setHasMore] = useState(true)

    // Total Insentif card
    const [totalInsentif, setTotalInsentif] = useState(0)
    const [isLoadingInsentif, setIsLoadingInsentif] = useState(false)

    // Pagination & Search
    const [page, setPage] = useState(1)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const limit = 15

    const observer = useRef<IntersectionObserver | null>(null)
    const lastRowRef = useCallback((node: HTMLTableRowElement | null) => {
        if (isLoading || isFetchingMore) return
        if (observer.current) observer.current.disconnect()
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prev => prev + 1)
            }
        })
        if (node) observer.current.observe(node)
    }, [isLoading, isFetchingMore, hasMore])

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedTransaction, setSelectedTransaction] = useState<TeknisiTransactionDetailResponse['data'] | null>(null)
    const [isLoadingDetail, setIsLoadingDetail] = useState(false)
    const [uploadingItemId, setUploadingItemId] = useState<string | null>(null)
    const [deletingUploadId, setDeletingUploadId] = useState<string | null>(null)

    // Preview Modal States
    const [previewUploads, setPreviewUploads] = useState<{ id: string, image_url: string }[] | null>(null)
    const [previewIndex, setPreviewIndex] = useState(0)

    const openPreview = (e: React.MouseEvent, uploads: { id: string, image_url: string }[]) => {
        e.stopPropagation()
        setPreviewUploads(uploads)
        setPreviewIndex(0)
    }

    const nextPreview = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (previewUploads) setPreviewIndex((prev) => (prev + 1) % previewUploads.length)
    }

    const prevPreview = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (previewUploads) setPreviewIndex((prev) => (prev - 1 + previewUploads.length) % previewUploads.length)
    }

    // Hidden file input ref per item
    const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

    const fetchInsentifTotal = useCallback(async (start: string, end: string) => {
        if (!canViewInsentif) return
        setIsLoadingInsentif(true)
        try {
            const res = await getTeknisiInsentifTotal({ start_date: start, end_date: end })
            if (res.success) setTotalInsentif(res.data.total_insentif)
        } catch {
            // silent fail
        } finally {
            setIsLoadingInsentif(false)
        }
    }, [canViewInsentif])

    const fetchData = useCallback(async (currentPage: number, search: string, start: string, end: string, isNewSearch = false) => {
        if (isNewSearch) {
            setIsLoading(true)
        } else {
            setIsFetchingMore(true)
        }

        try {
            const res = await getTeknisiTransactions({ page: currentPage, limit, search, start_date: start, end_date: end })
            if (res.success) {
                if (isNewSearch) {
                    setTransactions(res.data.items)
                } else {
                    setTransactions(prev => [...prev, ...res.data.items])
                }
                setHasMore(currentPage < res.data.total_pages)
            }
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setIsLoading(false)
            setIsFetchingMore(false)
        }
    }, [])

    // Refresh on filter/search change
    useEffect(() => {
        setPage(1)
        setHasMore(true)
        fetchData(1, searchQuery, startDate, endDate, true)
        fetchInsentifTotal(startDate, endDate)
    }, [searchQuery, startDate, endDate, fetchData, fetchInsentifTotal])

    useEffect(() => {
        if (page > 1) fetchData(page, searchQuery, startDate, endDate, false)
    }, [page, searchQuery, startDate, endDate, fetchData])

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setSearchQuery(searchTerm)
    }

    const handleClearSearch = () => {
        setSearchTerm('')
        setSearchQuery('')
    }

    const handleDateChange = (start: string, end: string) => {
        setStartDate(start)
        setEndDate(end)
        setPage(1)
        setHasMore(true)
    }

    const openDetailModal = async (transaksiId: string) => {
        setIsModalOpen(true)
        setIsLoadingDetail(true)
        setSelectedTransaction(null)
        try {
            const res = await getTeknisiTransactionDetail(transaksiId)
            if (res.success) {
                setSelectedTransaction(res.data)
            }
        } catch (error: any) {
            toast.error(error.message)
            setIsModalOpen(false)
        } finally {
            setIsLoadingDetail(false)
        }
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, itemDetailId: string) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            toast.error('Harap pilih file gambar')
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Ukuran gambar maksimal 5MB')
            return
        }

        setUploadingItemId(itemDetailId)
        try {
            const res = await uploadTeknisiImage(itemDetailId, file)
            if (res.success) {
                toast.success('Bukti pengerjaan berhasil diupload')
                // Update local state
                if (selectedTransaction) {
                    setSelectedTransaction(prev => {
                        if (!prev) return prev
                        const updatedDetails = prev.details.map(d => {
                            if (d.id === itemDetailId) {
                                return {
                                    ...d,
                                    uploads: [...(d.uploads || []), res.data]
                                }
                            }
                            return d
                        })
                        return { ...prev, details: updatedDetails }
                    })
                }

                // Refresh list item in background to update badge status if needed
                const refreshedList = await getTeknisiTransactions({ page: 1, limit: page * limit, search: searchQuery, start_date: startDate, end_date: endDate })
                if (refreshedList.success) {
                    setTransactions(refreshedList.data.items)
                }
            }
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setUploadingItemId(null)
            if (fileInputRefs.current[itemDetailId]) {
                fileInputRefs.current[itemDetailId]!.value = '' // reset input
            }
        }
    }

    const handleDeleteUpload = async (uploadId: string, itemDetailId: string) => {
        if (!confirm('Yakin ingin menghapus gambar ini?')) return

        setDeletingUploadId(uploadId)
        try {
            const res = await deleteTeknisiImage(uploadId)
            if (res.success) {
                toast.success(res.message)
                // Update local state
                if (selectedTransaction) {
                    setSelectedTransaction(prev => {
                        if (!prev) return prev
                        const updatedDetails = prev.details.map(d => {
                            if (d.id === itemDetailId) {
                                return {
                                    ...d,
                                    uploads: d.uploads.filter(u => u.id !== uploadId)
                                }
                            }
                            return d
                        })
                        return { ...prev, details: updatedDetails }
                    })
                }

                // Refresh list item in background to update badge status if needed
                const refreshedList = await getTeknisiTransactions({ page: 1, limit: page * limit, search: searchQuery, start_date: startDate, end_date: endDate })
                if (refreshedList.success) {
                    setTransactions(refreshedList.data.items)
                }
            }
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setDeletingUploadId(null)
        }
    }

    const getStatusColor = (status: 'none' | 'partial' | 'complete') => {
        switch (status) {
            case 'complete': return 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20'
            case 'partial': return 'bg-amber-500/10 text-amber-400 ring-amber-500/20'
            default: return 'bg-red-500/10 text-red-400 ring-red-500/20'
        }
    }

    const getStatusText = (status: 'none' | 'partial' | 'complete') => {
        switch (status) {
            case 'complete': return 'Sudah Lengkap'
            case 'partial': return 'Sebagian'
            default: return 'Belum Upload'
        }
    }

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden p-6 gap-6 relative" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-30">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-blue-500/20 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                        <Wrench className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight drop-shadow-sm" style={{ color: 'var(--foreground)' }}>
                            Teknisi & Pengerjaan
                        </h1>
                        <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                            Kelola upload bukti pengerjaan layanan
                        </p>
                    </div>
                </div>

                {/* Filters: Search + Date Range */}
                <div className="flex flex-wrap items-center gap-3">
                    {/* Date Range Picker */}
                    <DateRangePicker
                        startDate={startDate}
                        endDate={endDate}
                        onDateChange={handleDateChange}
                        align="right"
                    />

                    {/* Search */}
                    <form onSubmit={handleSearchSubmit} className="relative w-full md:w-60">
                        <input
                            className="w-full pl-10 pr-10 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                            style={{ background: 'var(--surface-subtle)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                            placeholder="Cari invoice/customer..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                                style={{ color: 'var(--muted-foreground)' }}
                            >
                                <XCircle className="w-4 h-4" />
                            </button>
                        )}
                    </form>
                </div>
            </div>

            {/* Total Insentif Card */}
            {canViewInsentif && (
                <div className="relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                        className="bg-gradient-to-br from-emerald-900/30 to-teal-900/30 backdrop-blur-xl border border-emerald-500/20 rounded-2xl px-6 py-5 flex items-center justify-between shadow-xl"
                    >
                        {/* Left */}
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                                <BadgeDollarSign className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Total Akumulasi Insentif Teknisi</p>
                                <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                                    Periode {format(new Date(startDate.replace(/-/g, '/')), 'dd MMM yyyy', { locale: localeId })} s/d {format(new Date(endDate.replace(/-/g, '/')), 'dd MMM yyyy', { locale: localeId })}
                                </p>
                            </div>
                        </div>
                        {/* Right */}
                        <div className="text-right">
                            {isLoadingInsentif ? (
                                <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin ml-auto" />
                            ) : (
                                <p className="text-2xl font-black text-white tracking-tight">{formatCurrency(totalInsentif)}</p>
                            )}
                            <p className="text-xs text-emerald-400/70 mt-0.5">Semua teknisi aktif</p>
                        </div>
                        {/* Decorative glow */}
                        <div className="absolute right-0 top-0 w-40 h-full rounded-2xl pointer-events-none bg-gradient-to-l from-emerald-500/5 to-transparent" />
                    </motion.div>
                </div>
            )}

            {/* Table Area */}
            <div className="flex-1 overflow-hidden relative z-10 flex flex-col border rounded-2xl shadow-xl" style={{ background: 'var(--card)', borderColor: 'var(--border-subtle)' }}>
                {isLoading && page === 1 ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left whitespace-nowrap">
                            <thead
                                className="sticky top-0 text-xs uppercase font-semibold tracking-wider z-20 border-b shadow-sm"
                                style={{ background: 'var(--surface-overlay)', color: 'var(--muted-foreground)', borderColor: 'var(--border-subtle)' }}
                            >
                                <tr>
                                    <th className="px-6 py-4">Tanggal & Waktu</th>
                                    <th className="px-6 py-4">Nomor Invoice</th>
                                    <th className="px-6 py-4">Nama Customer</th>
                                    <th className="px-6 py-4 text-center">Status Upload</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-16 text-center text-gray-500">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                                                    <Wrench className="w-8 h-8 text-gray-600" />
                                                </div>
                                                <p>Tidak ada transaksi layanan di periode ini.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((t, idx) => {
                                        const isLastElement = transactions.length === idx + 1
                                        return (
                                            <motion.tr
                                                ref={isLastElement ? lastRowRef : null}
                                                key={t.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.2 }}
                                                onClick={() => openDetailModal(t.id)}
                                                className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                                                        {format(new Date(t.transaction_date), 'dd MMM yyyy', { locale: localeId })}
                                                    </div>
                                                    <div className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                                                        {format(new Date(t.transaction_date), 'HH:mm')}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-medium text-blue-400">{t.receipt_number}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span style={{ color: 'var(--foreground)' }}>{t.customer_name}</span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium ring-1 ${getStatusColor(t.upload_status)}`}>
                                                            {getStatusText(t.upload_status)} ({t.uploaded_count}/{t.total_layanan})
                                                        </span>
                                                        {t.uploads && t.uploads.length > 0 && (
                                                            <button
                                                                onClick={(e) => openPreview(e, t.uploads!)}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-colors text-xs font-medium"
                                                            >
                                                                <Eye className="w-3.5 h-3.5" />
                                                                Preview ({t.uploads.length})
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        )
                                    })
                                )}
                                {isFetchingMore && (
                                    <tr>
                                        <td colSpan={4} className="py-6 text-center">
                                            <div className="flex items-center justify-center gap-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                                                <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                                                Memuat lagi...
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Decorative Background */}
            <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] rounded-full pointer-events-none opacity-[0.02] blur-[100px] bg-blue-500" />
            <div className="absolute bottom-[20%] left-[10%] w-[300px] h-[300px] rounded-full pointer-events-none opacity-[0.02] blur-[80px] bg-cyan-500" />

            {/* Detail Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border"
                            style={{ background: 'var(--surface-overlay)', borderColor: 'var(--border-subtle)' }}
                        >
                            {/* Modal Header */}
                            <div className="px-6 py-4 flex items-center justify-between border-b" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-overlay)' }}>
                                <div>
                                    <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
                                        {selectedTransaction ? `Detail Pengerjaan: ${selectedTransaction.receipt_number}` : 'Memuat Detail...'}
                                    </h2>
                                    {selectedTransaction && (
                                        <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
                                            {selectedTransaction.customer_name} • {format(new Date(selectedTransaction.transaction_date), 'dd MMM yyyy HH:mm', { locale: localeId })}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center gap-3">
                                    {/* Total insentif badge in modal header */}
                                    {selectedTransaction && !isLoadingDetail && canViewInsentif && (
                                        <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-right">
                                            <p className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">Total Insentif</p>
                                            <p className="text-sm font-bold text-emerald-300">
                                                {formatCurrency(
                                                    selectedTransaction.details.reduce((sum, d) => sum + d.insentif_per_item * d.quantity, 0)
                                                )}
                                            </p>
                                        </div>
                                    )}
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="p-2 rounded-xl transition-colors cursor-pointer hover:bg-white/5"
                                        style={{ color: 'var(--muted-foreground)' }}
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <div className="flex-1 overflow-auto p-6 bg-black/20">
                                {isLoadingDetail ? (
                                    <div className="flex flex-col items-center justify-center h-48 gap-3">
                                        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                                        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Mengambil data item layanan...</p>
                                    </div>
                                ) : selectedTransaction?.details.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-48 gap-3">
                                        <Wrench className="w-8 h-8 text-gray-500" />
                                        <p className="text-sm text-gray-500">Tidak ada item layanan di transaksi ini.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {selectedTransaction?.details.map(item => {
                                            // Check upload deadline
                                            let isPastDeadline = false
                                            if (selectedTransaction) {
                                                const txDate = new Date(selectedTransaction.transaction_date)
                                                const txDateWIB = new Date(txDate.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }))
                                                const nowWIB = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }))
                                                isPastDeadline =
                                                    txDateWIB.getFullYear() !== nowWIB.getFullYear() ||
                                                    txDateWIB.getMonth() !== nowWIB.getMonth() ||
                                                    txDateWIB.getDate() !== nowWIB.getDate()
                                            }
                                            const canUpload = isAdministrator || !isPastDeadline

                                            return (
                                            <div key={item.id} className="p-4 rounded-xl border" style={{ background: 'var(--surface-overlay)', borderColor: 'var(--border-subtle)' }}>
                                                {/* Item Header */}
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h3 className="font-semibold text-base" style={{ color: 'var(--foreground)' }}>{item.item_name}</h3>
                                                        <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                                                            {item.kategori_name} • Teknisi: {item.staff_name || <span className="italic text-gray-500">Belum di-assign</span>}
                                                        </p>
                                                    </div>
                                                    <div className="text-right flex flex-col gap-1">
                                                        <div>
                                                            <p className="font-semibold text-blue-400">Rp {parseInt(item.price).toLocaleString('id-ID')}</p>
                                                            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Qty: {item.quantity}</p>
                                                        </div>
                                                        {/* Insentif badge */}
                                                        {item.insentif_per_item > 0 && canViewInsentif && (
                                                            <div className="mt-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-right">
                                                                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Insentif</p>
                                                                <p className="text-xs font-semibold text-emerald-300">
                                                                    {formatCurrency(item.insentif_per_item)}
                                                                    {item.quantity > 1 && (
                                                                        <span className="text-[10px] text-emerald-500/70 ml-1">× {item.quantity} = {formatCurrency(item.insentif_per_item * item.quantity)}</span>
                                                                    )}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Uploads Area */}
                                                <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                                                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                                                        <ImageIcon className="w-4 h-4 text-blue-400" />
                                                        Bukti Pengerjaan ({item.uploads.length})
                                                    </h4>

                                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                                        {item.uploads.map(upload => (
                                                            <div key={upload.id} className="group relative rounded-lg overflow-hidden border aspect-square" style={{ borderColor: 'var(--border-subtle)' }}>
                                                                <img
                                                                    src={upload.image_url}
                                                                    alt="Bukti"
                                                                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                                                />
                                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2">
                                                                    <p className="text-[10px] text-white/80 text-center mb-2 line-clamp-2">
                                                                        Oleh: {upload.uploaded_by_name}
                                                                        <br />
                                                                        {format(new Date(upload.created_at), 'dd/MM/yy HH:mm')}
                                                                    </p>
                                                                    <button
                                                                        onClick={() => handleDeleteUpload(upload.id, item.id)}
                                                                        disabled={deletingUploadId === upload.id || !canUpload}
                                                                        title={!canUpload ? 'Waktu Hapus Habis' : 'Hapus Bukti'}
                                                                        className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                                                    >
                                                                        {deletingUploadId === upload.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}

                                                        {/* Upload Button */}
                                                        <div className="relative">
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                className="hidden"
                                                                ref={el => { fileInputRefs.current[item.id] = el }}
                                                                onChange={(e) => handleFileChange(e, item.id)}
                                                                disabled={uploadingItemId === item.id || !canUpload}
                                                            />
                                                            <button
                                                                onClick={() => fileInputRefs.current[item.id]?.click()}
                                                                disabled={uploadingItemId === item.id || !canUpload}
                                                                className="w-full h-full min-h-[120px] rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 hover:bg-blue-500/5 hover:border-blue-500/50 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed aspect-square"
                                                                style={{ borderColor: 'var(--border-subtle)', color: 'var(--muted-foreground)' }}
                                                            >
                                                                {uploadingItemId === item.id ? (
                                                                    <>
                                                                        <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                                                                        <span className="text-xs">Mengupload...</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                                                                            <Upload className="w-4 h-4 text-blue-400" />
                                                                        </div>
                                                                        <span className="text-xs font-medium text-center px-2">
                                                                            {canUpload ? 'Upload Foto' : 'Waktu Habis'}
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Preview Modal */}
            <AnimatePresence>
                {previewUploads && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md"
                            onClick={(e) => { e.stopPropagation(); setPreviewUploads(null); }}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] w-full max-w-4xl max-h-[90vh] flex flex-col items-center justify-center pointer-events-none"
                        >
                            <div className="relative w-full h-full flex items-center justify-center pointer-events-auto">
                                <img
                                    src={previewUploads[previewIndex].image_url}
                                    alt="Preview"
                                    className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                                />

                                {/* Close Button */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); setPreviewUploads(null); }}
                                    className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors backdrop-blur-sm"
                                >
                                    <X className="w-6 h-6" />
                                </button>

                                {/* Navigation Arrows */}
                                {previewUploads.length > 1 && (
                                    <>
                                        <button
                                            onClick={prevPreview}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors backdrop-blur-sm"
                                        >
                                            <ChevronLeft className="w-6 h-6" />
                                        </button>
                                        <button
                                            onClick={nextPreview}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors backdrop-blur-sm"
                                        >
                                            <ChevronRight className="w-6 h-6" />
                                        </button>

                                        {/* Indicators */}
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-sm rounded-full">
                                            {previewUploads.map((_, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={(e) => { e.stopPropagation(); setPreviewIndex(idx); }}
                                                    className={`w-2 h-2 rounded-full transition-all ${idx === previewIndex ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/60'}`}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
