import { useState, useEffect, useCallback, useRef } from 'react'
import { ArrowLeft, Receipt, Loader2, Search, FileText } from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'motion/react'
import { getCustomerTransactions } from '../services/customerService'
import { KlaimGaransiModal } from '../components/customers/KlaimGaransiModal'

export function CustomerTransactionsPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

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

    const [customer, setCustomer] = useState<{ id: string, name: string } | null>(null)
    const [transactions, setTransactions] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const limit = 20

    // Modal state for detail
    const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null)

    // Modal state for klaim garansi
    const [isKlaimModalOpen, setIsKlaimModalOpen] = useState(false)
    const [selectedDetailForKlaim, setSelectedDetailForKlaim] = useState<{id: string, name: string} | null>(null)

    const loadMoreRef = useRef<HTMLDivElement>(null)

    const fetchTransactions = useCallback(async (page: number) => {
        if (!id) return
        if (page === 1) setIsLoading(true)
        else setIsLoadingMore(true)

        try {
            const res = await getCustomerTransactions(id, { page, limit })
            if (res.success) {
                setCustomer(res.data.customer)
                const newItems = res.data.items
                setTransactions(prev => page === 1 ? newItems : [...prev, ...newItems])
                setHasMore(page < res.data.pagination.total_pages)
                setCurrentPage(page)
            } else {
                toast.error(res.message || 'Gagal memuat transaksi')
            }
        } catch {
            toast.error('Terjadi kesalahan')
        } finally {
            setIsLoading(false)
            setIsLoadingMore(false)
        }
    }, [id, limit])

    useEffect(() => {
        fetchTransactions(1)
    }, [fetchTransactions])

    useEffect(() => {
        const el = loadMoreRef.current
        if (!el) return
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoadingMore && !isLoading) {
                    fetchTransactions(currentPage + 1)
                }
            },
            { threshold: 0.1 }
        )
        observer.observe(el)
        return () => observer.disconnect()
    }, [hasMore, isLoadingMore, isLoading, currentPage, fetchTransactions])

    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
    }

    const formatDate = (dateStr: string) => {
        return new Intl.DateTimeFormat('id-ID', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        }).format(new Date(dateStr))
    }

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden p-6 gap-6 relative" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/customers')}
                        className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/5 transition-colors"
                        style={{ color: 'var(--muted-foreground)' }}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-indigo-500/20 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                        <Receipt className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight drop-shadow-sm" style={{ color: 'var(--foreground)' }}>
                            Riwayat Transaksi
                        </h1>
                        <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                            {customer ? `Pelanggan: ${customer.name}` : 'Memuat data pelanggan...'}
                        </p>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-hidden relative z-10 flex flex-col border rounded-2xl shadow-xl" style={{ background: 'var(--card)', borderColor: 'var(--border-subtle)' }}>
                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-auto p-4 space-y-4">
                        {transactions.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center gap-3 opacity-50">
                                <Search className="w-12 h-12 mb-2" />
                                <p>Belum ada transaksi untuk pelanggan ini.</p>
                            </div>
                        ) : (
                            transactions.map((trx, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: Math.min(idx * 0.05, 0.3) }}
                                    key={trx.id}
                                    onClick={() => setSelectedTransaction(trx)}
                                    className="p-4 rounded-xl border border-white/5 cursor-pointer hover:border-indigo-500/30 hover:bg-white/[0.02] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                                    style={{ background: 'var(--surface-subtle)' }}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-lg" style={{ color: 'var(--foreground)' }}>{trx.receipt_number}</p>
                                            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{formatDate(trx.transaction_date)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Total Belanja</p>
                                            <p className="font-bold text-lg text-emerald-400">{formatRupiah(parseFloat(trx.total_amount))}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}

                        {/* Infinite scroll trigger */}
                        <div ref={loadMoreRef} className="h-16 flex items-center justify-center mt-4">
                            {isLoadingMore && (
                                <div className="flex items-center gap-2" style={{ color: 'var(--muted-foreground)' }}>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="text-sm">Memuat lebih banyak...</span>
                                </div>
                            )}
                            {!hasMore && transactions.length > 0 && (
                                <p className="text-xs italic" style={{ color: 'var(--muted-foreground)' }}>Semua transaksi telah dimuat</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedTransaction && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedTransaction(null)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            className="w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-white/10"
                            style={{ background: 'var(--background)' }}
                        >
                            <div className="p-5 border-b border-white/5 flex items-center justify-between" style={{ background: 'var(--surface-overlay)' }}>
                                <div>
                                    <h2 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>Detail Transaksi</h2>
                                    <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{selectedTransaction.receipt_number}</p>
                                </div>
                                <button onClick={() => setSelectedTransaction(null)} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                                    Tutup
                                </button>
                            </div>
                            
                            <div className="p-6 overflow-y-auto flex-1 space-y-6">
                                <div className="flex flex-wrap gap-6">
                                    <div>
                                        <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Tanggal</p>
                                        <p className="font-medium mt-1">{formatDate(selectedTransaction.transaction_date)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Kasir</p>
                                        <p className="font-medium mt-1">{selectedTransaction.user?.username || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Toko</p>
                                        <p className="font-medium mt-1">{selectedTransaction.store?.name || '-'}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--muted-foreground)' }}>Item Pembelian</p>
                                    <div className="space-y-3">
                                        {selectedTransaction.details?.map((detail: any) => (
                                            <div key={detail.id} className="flex flex-col p-3 rounded-xl gap-2" style={{ background: 'var(--surface-subtle)' }}>
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-medium">
                                                            {detail.item_name}
                                                            {detail.item_type === 'layanan' && detail.staff?.name && (
                                                                <span className="ml-2 text-xs text-gray-400 font-normal">
                                                                    (Teknisi: {detail.staff.name})
                                                                </span>
                                                            )}
                                                        </p>
                                                        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                                                            {detail.quantity} x {formatRupiah(parseFloat(detail.price))}
                                                        </p>
                                                    </div>
                                                    <div className="text-right flex flex-col items-end gap-2">
                                                        <p className="font-semibold text-right">{formatRupiah(parseFloat(detail.subtotal))}</p>
                                                        
                                                        {/* TOMBOL KLAIM GARANSI (di kanan) */}
                                                        {detail.item_type === 'layanan' && selectedTransaction.payment_status?.toLowerCase() === 'paid' && !detail.klaimGaransi && (
                                                            <div className="flex flex-col items-end gap-1">
                                                                {detail.batas_garansi && new Date() > new Date(detail.batas_garansi) ? (
                                                                    <span className="text-[10px] text-red-400 font-medium bg-red-500/10 px-2 py-1 rounded">Garansi Habis ({formatDate(detail.batas_garansi)})</span>
                                                                ) : (
                                                                    <>
                                                                        {detail.batas_garansi && (
                                                                            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded mb-1">
                                                                                Garansi s.d. {new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(detail.batas_garansi))}
                                                                            </span>
                                                                        )}
                                                                        {userPermissions.includes('customer.claim_warranty') && (
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation()
                                                                                    setSelectedDetailForKlaim({ id: detail.id, name: detail.item_name })
                                                                                    setIsKlaimModalOpen(true)
                                                                                }}
                                                                                className="px-3 py-1.5 bg-indigo-600/90 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-all shadow-sm shadow-indigo-900/50"
                                                                            >
                                                                                Klaim Garansi
                                                                            </button>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* DETAIL KLAIM GARANSI (full width di bawah) */}
                                                {detail.item_type === 'layanan' && detail.klaimGaransi && (
                                                    <div className="text-left bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-lg text-sm w-full mt-1">
                                                        <p className="font-bold text-indigo-400 mb-2 flex items-center justify-between">
                                                            <span>Status Klaim Garansi</span>
                                                        </p>
                                                        <div className="space-y-1.5 text-sm">
                                                            <p><span className="text-indigo-300">Waktu:</span> {formatDate(detail.klaimGaransi.tanggal_klaim)}</p>
                                                            <p><span className="text-indigo-300">Tindakan:</span> {detail.klaimGaransi.tindakan === 'ganti_sparepart' ? 'Ganti Sparepart' : 'Tanpa Ganti'}</p>
                                                            {detail.klaimGaransi.detail_tindakan && <p className="text-gray-300 italic">Detail: "{detail.klaimGaransi.detail_tindakan}"</p>}
                                                            {detail.klaimGaransi.kendala && <p className="text-gray-300 italic">Kendala: "{detail.klaimGaransi.kendala}"</p>}
                                                            {detail.klaimGaransi.tipe_hp && <p><span className="text-indigo-300">Tipe HP:</span> {detail.klaimGaransi.tipe_hp.name}</p>}
                                                            {detail.klaimGaransi.merk && <p><span className="text-indigo-300">Merk:</span> {detail.klaimGaransi.merk}</p>}
                                                            {detail.klaimGaransi.supplier && <p><span className="text-indigo-300">Supplier:</span> {detail.klaimGaransi.supplier.name}</p>}
                                                            {detail.klaimGaransi.bukti && detail.klaimGaransi.bukti.length > 0 && (
                                                                <div className="flex gap-2 mt-3 flex-wrap">
                                                                    {detail.klaimGaransi.bukti.map((b: any, i: number) => (
                                                                        <a key={i} href={b.image_url} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-md border border-white/20 overflow-hidden hover:opacity-80 hover:border-indigo-400 transition-all block">
                                                                            <img src={b.image_url} className="w-full h-full object-cover" alt="Bukti" />
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {parseFloat(detail.discount_value || '0') > 0 && (
                                                    <div className="flex justify-between items-center text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded-md">
                                                        <span>
                                                            Diskon Item ({detail.discount_type === 'percentage' ? `${detail.discount_value}%` : 'Nominal'})
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="border-t border-white/10 pt-4 space-y-2">
                                    <div className="flex justify-between text-sm" style={{ color: 'var(--muted-foreground)' }}>
                                        <span>Subtotal</span>
                                        <span>{formatRupiah(parseFloat(selectedTransaction.subtotal))}</span>
                                    </div>
                                    {parseFloat(selectedTransaction.discount || '0') > 0 && (
                                        <div className="flex justify-between text-sm text-red-400">
                                            <span>Diskon ({selectedTransaction.discount_type === 'percentage' ? `${selectedTransaction.discount}%` : 'Nominal'})</span>
                                            <span>-{formatRupiah(parseFloat(selectedTransaction.subtotal) - parseFloat(selectedTransaction.total_amount))}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t border-white/5 mb-4">
                                        <span>Total</span>
                                        <span className="text-emerald-400">{formatRupiah(parseFloat(selectedTransaction.total_amount))}</span>
                                    </div>

                                    {/* Payment Methods */}
                                    {selectedTransaction.payments && selectedTransaction.payments.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                                            <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--muted-foreground)' }}>Metode Pembayaran</p>
                                            {selectedTransaction.payments.map((payment: any) => (
                                                <div key={payment.id} className="flex justify-between text-sm">
                                                    <span className="capitalize">{payment.payment_method.replace('_', ' ')}</span>
                                                    <span>{formatRupiah(parseFloat(payment.nominal))}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Decorative Background */}
            <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] rounded-full pointer-events-none opacity-[0.02] blur-[100px] bg-indigo-500" />
            <div className="absolute bottom-[20%] left-[10%] w-[300px] h-[300px] rounded-full pointer-events-none opacity-[0.02] blur-[80px] bg-purple-500" />

            {/* Klaim Garansi Modal */}
            {selectedDetailForKlaim && (
                <KlaimGaransiModal
                    isOpen={isKlaimModalOpen}
                    onClose={() => setIsKlaimModalOpen(false)}
                    transaksiDetailId={selectedDetailForKlaim.id}
                    itemName={selectedDetailForKlaim.name}
                    onSuccess={(newKlaimData) => {
                        // 1. Fetch data list terbaru di background
                        fetchTransactions(1)
                        // 2. Update selectedTransaction secara langsung agar UI di modal detail transaksi langsung berubah
                        if (selectedTransaction) {
                            const updatedDetails = selectedTransaction.details.map((d: any) => {
                                if (d.id === selectedDetailForKlaim.id) {
                                    return { ...d, klaimGaransi: newKlaimData }
                                }
                                return d
                            })
                            setSelectedTransaction({ ...selectedTransaction, details: updatedDetails })
                        }
                        setIsKlaimModalOpen(false)
                    }}
                />
            )}
        </div>
    )
}
