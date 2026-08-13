import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, UserCheck } from 'lucide-react'
import type { Staff } from '../../services/staffService'

interface StaffModalProps {
    isOpen: boolean
    onClose: () => void
    staff: Staff | null
    onSave: (id: string | null, data: { name: string }) => Promise<void>
}

export function StaffModal({ isOpen, onClose, staff, onSave }: StaffModalProps) {
    const [name, setName] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setName(staff?.name || '')
        }
    }, [isOpen, staff])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return
        setIsSubmitting(true)
        try {
            await onSave(staff ? staff.id : null, { name: name.trim() })
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
                    className="relative w-full max-w-md border rounded-2xl shadow-2xl overflow-hidden"
                    style={{ background: 'var(--surface-modal)', borderColor: 'var(--border)' }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-violet-500/10 rounded-xl">
                                <UserCheck className="w-5 h-5 text-violet-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
                                    {staff ? 'Edit Staff' : 'Tambah Staff Baru'}
                                </h2>
                                <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                                    {staff ? 'Perbarui informasi staff' : 'Masukkan nama staff baru'}
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
                        <div>
                            <label className="block text-sm font-medium mb-1.5 ml-1" style={{ color: 'var(--foreground)' }}>
                                Nama Staff <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <UserCheck className="h-5 w-5" style={{ color: 'var(--muted-foreground)' }} />
                                </div>
                                <input
                                    type="text"
                                    required
                                    autoFocus
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-11 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-200"
                                    style={{ background: 'var(--input-background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                                    placeholder="Contoh: Budi Santoso"
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-3 pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
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
                                disabled={isSubmitting || !name.trim()}
                                className="relative flex items-center justify-center min-w-[120px] px-5 py-2.5 text-sm font-medium text-white bg-violet-600 rounded-xl hover:bg-violet-700 transition-all disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <span>{staff ? 'Simpan' : 'Tambah'}</span>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
