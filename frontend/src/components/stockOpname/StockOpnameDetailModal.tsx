import { useState, useEffect } from 'react'
import { X, FileText, CheckCircle2, XCircle, Clock, Loader2, AlertCircle, Edit2 } from 'lucide-react'
import type { StockOpname } from '../../services/stockOpnameService'
import { stockOpnameService } from '../../services/stockOpnameService'
import { toast } from 'sonner'
import { ConfirmationModal } from '../ui/ConfirmationModal'

interface StockOpnameDetailModalProps {
    isOpen: boolean
    onClose: () => void
    opnameId: string | null
    onUpdate: () => void
    onEdit: (id: string) => void
}

export function StockOpnameDetailModal({ isOpen, onClose, opnameId, onUpdate, onEdit }: StockOpnameDetailModalProps) {
    const [loading, setLoading] = useState(false)
    const [actionLoading, setActionLoading] = useState(false)
    const [opname, setOpname] = useState<StockOpname | null>(null)
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        type: 'COMPLETE' | 'CANCEL' | null;
    }>({ isOpen: false, type: null });

    useEffect(() => {
        if (isOpen && opnameId) {
            fetchDetail()
        } else {
            setOpname(null)
        }
    }, [isOpen, opnameId])

    const fetchDetail = async () => {
        if (!opnameId) return
        setLoading(true)
        try {
            const res = await stockOpnameService.getById(opnameId)
            if (res.success) {
                setOpname(res.data)
            } else {
                toast.error('Gagal memuat detail stok opname')
            }
        } catch (error) {
            console.error('Fetch detail error:', error)
            toast.error('Terjadi kesalahan saat memuat data')
        } finally {
            setLoading(false)
        }
    }

    const handleComplete = async () => {
        if (!opnameId) return
        
        setActionLoading(true)
        try {
            const res = await stockOpnameService.complete(opnameId)
            if (res.success) {
                toast.success('Stok opname berhasil diselesaikan')
                onUpdate()
                fetchDetail()
            } else {
                toast.error(res.message || 'Gagal menyelesaikan stok opname')
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Terjadi kesalahan sistem')
        } finally {
            setActionLoading(false)
            setConfirmModal({ isOpen: false, type: null })
        }
    }

    const handleCancel = async () => {
        if (!opnameId) return
        
        setActionLoading(true)
        try {
            const res = await stockOpnameService.cancel(opnameId)
            if (res.success) {
                toast.success('Stok opname berhasil dibatalkan')
                onUpdate()
                fetchDetail()
            } else {
                toast.error(res.message || 'Gagal membatalkan stok opname')
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Terjadi kesalahan sistem')
        } finally {
            setActionLoading(false)
            setConfirmModal({ isOpen: false, type: null })
        }
    }

    if (!isOpen) return null

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return { bg: 'rgba(34, 197, 94, 0.15)', color: '#22C55E', icon: CheckCircle2, label: 'Selesai' }
            case 'CANCELLED':
                return { bg: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', icon: XCircle, label: 'Dibatalkan' }
            default:
                return { bg: 'rgba(234, 179, 8, 0.15)', color: '#EAB308', icon: Clock, label: 'Draft' }
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            
            <div 
                className="relative w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden rounded-3xl shadow-2xl"
                style={{ background: 'var(--surface-overlay)', border: '1px solid var(--border-subtle)' }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[var(--border-subtle)]">
                    <div>
                        <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Detail Stok Opname</h2>
                        {opname && (
                            <p className="text-sm font-mono mt-1" style={{ color: 'var(--muted-foreground)' }}>{opname.opname_number}</p>
                        )}
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-[rgba(255,255,255,0.05)] transition-colors cursor-pointer">
                        <X className="w-6 h-6" style={{ color: 'var(--muted-foreground)' }} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="w-10 h-10 animate-spin text-[#3B82F6]" />
                            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Memuat detail...</p>
                        </div>
                    ) : opname ? (
                        <div className="space-y-8">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)]">
                                    <label className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{ color: 'var(--muted-foreground)' }}>Status</label>
                                    <div className="flex items-center gap-1.5">
                                        <span 
                                            className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
                                            style={{ background: getStatusStyles(opname.status).bg, color: getStatusStyles(opname.status).color }}
                                        >
                                            {getStatusStyles(opname.status).label}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)]">
                                    <label className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{ color: 'var(--muted-foreground)' }}>Tanggal</label>
                                    <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                                        {new Date(opname.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                                <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)]">
                                    <label className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{ color: 'var(--muted-foreground)' }}>Petugas</label>
                                    <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{opname.user?.username || '-'}</p>
                                </div>
                                <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)]">
                                    <label className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{ color: 'var(--muted-foreground)' }}>Total Item</label>
                                    <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{opname.details?.length || 0} Produk</p>
                                </div>
                            </div>

                            {/* Keterangan */}
                            <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.01)] flex gap-4 items-start">
                                <FileText className="w-5 h-5 mt-0.5 shrink-0" style={{ color: 'var(--muted-foreground)' }} />
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{ color: 'var(--muted-foreground)' }}>Keterangan Umum</label>
                                    <p className="text-sm" style={{ color: 'var(--foreground)' }}>{opname.keterangan || 'Tidak ada keterangan tambahan.'}</p>
                                </div>
                            </div>

                            {/* Details Table */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold uppercase tracking-widest px-1" style={{ color: 'var(--muted-foreground)' }}>Daftar Penyesuaian Produk</h3>
                                <div className="rounded-2xl border overflow-x-auto" style={{ border: '1px solid var(--border-subtle)' }}>
                                    <table className="w-full text-left border-collapse min-w-[700px]">
                                        <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-subtle)' }}>
                                            <tr>
                                                <th className="px-4 py-3 text-xs font-semibold uppercase" style={{ color: 'var(--muted-foreground)' }}>Produk</th>
                                                <th className="px-4 py-3 text-xs font-semibold uppercase text-center" style={{ color: 'var(--muted-foreground)' }}>Sistem</th>
                                                <th className="px-4 py-3 text-xs font-semibold uppercase text-center" style={{ color: 'var(--muted-foreground)' }}>Fisik</th>
                                                <th className="px-4 py-3 text-xs font-semibold uppercase text-center" style={{ color: 'var(--muted-foreground)' }}>Selisih</th>
                                                <th className="px-4 py-3 text-xs font-semibold uppercase" style={{ color: 'var(--muted-foreground)' }}>Keterangan</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--border-subtle)]">
                                            {opname.details?.map(detail => {
                                                const selisihColor = detail.selisih === 0 ? 'var(--muted-foreground)' : detail.selisih > 0 ? '#22C55E' : '#EF4444'
                                                return (
                                                    <tr key={detail.id} className="hover:bg-[rgba(255,255,255,0.01)] transition-colors">
                                                        <td className="px-4 py-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{(detail as any).product?.name || 'Produk Terhapus'}</span>
                                                                <span className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>SKU: {(detail as any).product?.sku || '-'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4 text-center text-sm" style={{ color: 'var(--foreground)' }}>{detail.stok_sistem}</td>
                                                        <td className="px-4 py-4 text-center text-sm font-bold" style={{ color: 'var(--foreground)' }}>{detail.stok_fisik}</td>
                                                        <td className="px-4 py-4 text-center text-sm font-black" style={{ color: selisihColor }}>
                                                            {detail.selisih > 0 ? `+${detail.selisih}` : detail.selisih}
                                                        </td>
                                                        <td className="px-4 py-4 text-sm italic" style={{ color: 'var(--muted-foreground)' }}>{detail.keterangan || '-'}</td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                            <AlertCircle className="w-12 h-12 text-red-500 opacity-20" />
                            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Data tidak ditemukan.</p>
                        </div>
                    )}
                </div>

                {/* Footer Actions (Only for Draft) */}
                {opname && opname.status === 'DRAFT' && (
                    <div className="p-6 border-t border-[var(--border-subtle)] bg-[rgba(255,255,255,0.01)] flex flex-col md:flex-row items-center justify-end gap-3">
                        <button
                            disabled={actionLoading}
                            onClick={() => onEdit(opname.id)}
                            className="w-full md:w-auto px-6 py-2.5 rounded-xl font-medium border border-[var(--border-subtle)] text-[var(--foreground)] hover:bg-[rgba(255,255,255,0.05)] transition-all flex items-center justify-center gap-2"
                        >
                            <Edit2 className="w-4 h-4" />
                            Edit Opname
                        </button>
                        <button
                            disabled={actionLoading}
                            onClick={() => setConfirmModal({ isOpen: true, type: 'CANCEL' })}
                            className="w-full md:w-auto px-6 py-2.5 rounded-xl font-medium border border-[#EF4444] text-[#EF4444] hover:bg-[#EF4444]/5 transition-all disabled:opacity-50"
                        >
                            Batalkan Opname
                        </button>
                        <button
                            disabled={actionLoading}
                            onClick={() => setConfirmModal({ isOpen: true, type: 'COMPLETE' })}
                            className="w-full md:w-auto px-8 py-2.5 rounded-xl font-medium text-white shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}
                        >
                            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            Finalisasi Stok
                        </button>
                    </div>
                )}
            </div>

            {/* Confirmation Modals */}
            <ConfirmationModal
                isOpen={confirmModal.isOpen && confirmModal.type === 'COMPLETE'}
                onClose={() => setConfirmModal({ isOpen: false, type: null })}
                onConfirm={handleComplete}
                title="Selesaikan Stok Opname"
                description="Apakah Anda yakin ingin menyelesaikan stok opname ini? Stok produk akan diperbarui secara permanen sesuai hasil perhitungan fisik."
                confirmText="Selesaikan"
                cancelText="Batal"
                icon={CheckCircle2}
                theme="primary"
                isLoading={actionLoading}
            />

            <ConfirmationModal
                isOpen={confirmModal.isOpen && confirmModal.type === 'CANCEL'}
                onClose={() => setConfirmModal({ isOpen: false, type: null })}
                onConfirm={handleCancel}
                title="Batalkan Stok Opname"
                description="Apakah Anda yakin ingin membatalkan stok opname ini? Data ini tidak akan dapat diubah lagi setelah dibatalkan."
                confirmText="Ya, Batalkan"
                cancelText="Kembali"
                icon={AlertCircle}
                theme="danger"
                isLoading={actionLoading}
            />
        </div>
    )
}
