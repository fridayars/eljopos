import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Store as StoreIcon, MapPin, Phone, FileText } from 'lucide-react'
import type { Store } from '../../services/storeService'

interface StoreModalProps {
    isOpen: boolean
    onClose: () => void
    store: Store | null
    onSave: (id: string | null, data: any) => Promise<void>
}

export function StoreModal({ isOpen, onClose, store, onSave }: StoreModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        notes: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (isOpen) {
            if (store) {
                setFormData({
                    name: store.name || '',
                    address: store.address || '',
                    phone: store.phone || '',
                    notes: store.notes || ''
                })
            } else {
                setFormData({
                    name: '',
                    address: '',
                    phone: '',
                    notes: ''
                })
            }
        }
    }, [isOpen, store])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        
        try {
            await onSave(store ? store.id : null, formData)
            onClose()
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen) return null

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
                    className="relative w-full max-w-lg border rounded-2xl shadow-2xl overflow-hidden"
                    style={{ background: 'var(--surface-modal)', borderColor: 'var(--border)' }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-xl">
                                <StoreIcon className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
                                    {store ? 'Edit Cabang' : 'Tambah Cabang Baru'}
                                </h2>
                                <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
                                    {store ? 'Perbarui informasi cabang' : 'Masukkan detail cabang baru'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl transition-colors"
                            style={{ color: 'var(--muted-foreground)', background: 'var(--surface-subtle)' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--foreground)'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted-foreground)'}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="space-y-4">
                            {/* Name Field */}
                            <div>
                                <label className="block text-sm font-medium mb-1.5 ml-1" style={{ color: 'var(--foreground)' }}>
                                    Nama Cabang <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <StoreIcon className="h-5 w-5" style={{ color: 'var(--muted-foreground)' }} />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full pl-11 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                                        style={{ background: 'var(--input-background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                                        placeholder="Contoh: Cabang Pusat"
                                    />
                                </div>
                            </div>

                            {/* Phone Field */}
                            <div>
                                <label className="block text-sm font-medium mb-1.5 ml-1" style={{ color: 'var(--foreground)' }}>
                                    No. Telepon
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Phone className="h-5 w-5" style={{ color: 'var(--muted-foreground)' }} />
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full pl-11 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                                        style={{ background: 'var(--input-background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                                        placeholder="08xxxxxxxxxx"
                                    />
                                </div>
                            </div>

                            {/* Address Field */}
                            <div>
                                <label className="block text-sm font-medium mb-1.5 ml-1" style={{ color: 'var(--foreground)' }}>
                                    Alamat
                                </label>
                                <div className="relative">
                                    <div className="absolute top-3 left-0 pl-3.5 flex items-start pointer-events-none">
                                        <MapPin className="h-5 w-5" style={{ color: 'var(--muted-foreground)' }} />
                                    </div>
                                    <textarea
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full pl-11 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 min-h-[80px] resize-y"
                                        style={{ background: 'var(--input-background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                                        placeholder="Alamat lengkap cabang..."
                                    />
                                </div>
                            </div>

                            {/* Notes Field */}
                            <div>
                                <label className="block text-sm font-medium mb-1.5 ml-1" style={{ color: 'var(--foreground)' }}>
                                    Catatan
                                </label>
                                <div className="relative">
                                    <div className="absolute top-3 left-0 pl-3.5 flex items-start pointer-events-none">
                                        <FileText className="h-5 w-5" style={{ color: 'var(--muted-foreground)' }} />
                                    </div>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        className="w-full pl-11 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 min-h-[80px] resize-y"
                                        style={{ background: 'var(--input-background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                                        placeholder="Catatan tambahan (opsional)..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="px-5 py-2.5 text-sm font-medium rounded-xl transition-all disabled:opacity-50"
                                style={{ color: 'var(--muted-foreground)', background: 'var(--surface-subtle)' }}
                                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--foreground)'}
                                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted-foreground)'}
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="relative flex items-center justify-center min-w-[120px] px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <span>{store ? 'Simpan' : 'Tambah'}</span>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
