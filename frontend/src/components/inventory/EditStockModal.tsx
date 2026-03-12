import { X, Save, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import type { ProductItem } from '../../services/productService'

interface EditStockModalProps {
    isOpen: boolean
    onClose: () => void
    product: ProductItem | null
    onSave: (productId: string, stockData: Record<string, any>) => void
}

export function EditStockModal({ isOpen, onClose, product, onSave }: EditStockModalProps) {
    const [stockAdjustmentAdd, setStockAdjustmentAdd] = useState<number>(0)
    const [stockAdjustmentSubtract, setStockAdjustmentSubtract] = useState<number>(0)
    const [stockAdjustmentNotes, setStockAdjustmentNotes] = useState<string>('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Reset form when modal opens/closes or product changes
    useEffect(() => {
        if (product) {
            setStockAdjustmentAdd(0)
            setStockAdjustmentSubtract(0)
            setStockAdjustmentNotes('')
        }
    }, [product, isOpen])

    const calculateFinalStock = () => {
        if (!product) return 0
        return product.stock + stockAdjustmentAdd - stockAdjustmentSubtract
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!product) return
        if (stockAdjustmentAdd === 0 && stockAdjustmentSubtract === 0) {
            toast.error('Silakan masukkan jumlah penyesuaian stok')
            return
        }
        if (stockAdjustmentAdd > 0 && stockAdjustmentSubtract > 0) {
            toast.error('Tidak bisa menambahkan dan mengurangi stok sekaligus')
            return
        }
        if (stockAdjustmentSubtract > product.stock - stockAdjustmentAdd) {
            toast.error('Stok tidak cukup untuk pengurangan')
            return
        }

        setIsSubmitting(true)
        try {
            const payload = {
                stockAdjustmentAdd,
                stockAdjustmentSubtract,
                stockAdjustmentNotes
            }
            await onSave(product.id, payload)
            toast.success('Stok produk berhasil diperbarui')
            onClose()
        } catch (error) {
            toast.error('Gagal memperbarui stok produk')
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const inputClass = "w-full h-12 bg-white/5 border border-purple-500/20 rounded-xl px-4 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all"

    if (!product) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-[0_0_40px_rgba(139,92,246,0.3)] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" style={{ background: 'var(--surface-modal)' }}>
                            {/* Header */}
                            <div className="p-6 border-b border-purple-500/20 flex items-center justify-between shrink-0">
                                <div>
                                    <h2 className="text-xl md:text-2xl text-gray-200">
                                        Edit Stok: {product.name}
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Stok saat ini: {product.stock}
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-10 h-10 rounded-lg bg-white/5 border border-purple-500/20 flex items-center justify-center text-gray-400 hover:text-gray-200 hover:border-red-500/50 transition-all cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
                                <div className="space-y-6">
                                    {/* Current Stock Display */}
                                    <div className="p-4 rounded-xl bg-white/5 border border-purple-500/20">
                                        <h3 className="text-sm text-gray-400 mb-2">Informasi Stok</h3>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-500">Stok Saat Ini:</span>
                                            <span className="text-gray-200 font-medium">{product.stock}</span>
                                        </div>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-gray-500">Stok Akhir yang Akan Datang:</span>
                                            <span className="text-blue-400 font-medium">{calculateFinalStock()}</span>
                                        </div>
                                    </div>

                                    {/* Stock Adjustment Fields */}
                                    <div className="space-y-4">
                                        <label className="block text-sm text-gray-400 font-medium">Penyesuaian Stok</label>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm text-gray-500 mb-2">Penambahan Stok</label>
                                                <input
                                                    type="number"
                                                    value={stockAdjustmentAdd || ''}
                                                    onChange={(e) => {
                                                        const val = Number(e.target.value) || 0;
                                                        setStockAdjustmentAdd(val);
                                                        if (val > 0) {
                                                            setStockAdjustmentSubtract(0);
                                                        }
                                                    }}
                                                    className={inputClass}
                                                    min="0"
                                                    placeholder="0"
                                                    disabled={stockAdjustmentSubtract > 0}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-500 mb-2">Pengurangan Stok</label>
                                                <input
                                                    type="number"
                                                    value={stockAdjustmentSubtract || ''}
                                                    onChange={(e) => {
                                                        const val = Number(e.target.value) || 0;
                                                        setStockAdjustmentSubtract(val);
                                                        if (val > 0) {
                                                            setStockAdjustmentAdd(0);
                                                        }
                                                    }}
                                                    className={inputClass}
                                                    min="0"
                                                    placeholder="0"
                                                    disabled={stockAdjustmentAdd > 0}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Keterangan Penyesuaian</label>
                                            <textarea
                                                value={stockAdjustmentNotes}
                                                onChange={(e) => setStockAdjustmentNotes(e.target.value)}
                                                className={`${inputClass} h-20 resize-y`}
                                                placeholder="Contoh: Stok bertambah karena pembelian baru, atau stok berkurang karena barang rusak"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </form>

                            {/* Footer */}
                            <div className="p-6 border-t border-purple-500/20 flex gap-3 justify-end shrink-0" style={{ background: 'var(--surface-overlay)' }}>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-6 py-2.5 rounded-xl border border-purple-500/30 text-gray-400 hover:text-gray-200 hover:border-purple-500/50 transition-all cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all cursor-pointer disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            Simpan Perubahan Stok
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}