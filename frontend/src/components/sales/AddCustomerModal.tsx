import { motion, AnimatePresence } from 'motion/react'
import { X, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import type { Customer } from '../../services/customerService'

interface AddCustomerModalProps {
    isOpen: boolean
    onClose: () => void
    onAddCustomer: (customer: Omit<Customer, 'id'>) => Promise<void>
}

export function AddCustomerModal({ isOpen, onClose, onAddCustomer }: AddCustomerModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
    })

    const [errors, setErrors] = useState<{ name?: string; phone?: string }>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (!isOpen) {
            setFormData({ name: '', phone: '', email: '', address: '' })
            setErrors({})
            setIsSubmitting(false)
        }
    }, [isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const newErrors: { name?: string; phone?: string } = {}
        if (!formData.name.trim()) {
            newErrors.name = 'Nama wajib diisi'
        }
        if (!formData.phone.trim()) {
            newErrors.phone = 'Nomor telepon wajib diisi'
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        setIsSubmitting(true)
        try {
            await onAddCustomer(formData)
            onClose()
        } catch {
            // error handled by parent
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
        if (errors[field as keyof typeof errors]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }))
        }
    }

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
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md z-50"
                    >
                        <div className="backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-[0_0_50px_rgba(59,130,246,0.3)] overflow-hidden" style={{ background: 'var(--background)' }}>
                            {/* Header */}
                            <div className="relative p-6 border-b border-purple-500/20">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-600/10" />
                                <div className="relative flex items-center justify-between">
                                    <h2 className="text-xl text-gray-200">Tambah Customer Baru</h2>
                                    <button
                                        onClick={onClose}
                                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                {/* Name */}
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">
                                        Nama Customer <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        placeholder="Ketikkan nama..."
                                        className={`w-full h-12 bg-white/5 border rounded-xl px-4 text-gray-300 placeholder:text-gray-600 focus:outline-none transition-all ${errors.name
                                            ? 'border-red-500/50 focus:border-red-500/70'
                                            : 'border-purple-500/20 focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                                            }`}
                                    />
                                    {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
                                </div>

                                {/* Phone */}
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">
                                        Nomor Telepon <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => handleChange('phone', e.target.value)}
                                        placeholder="Cth: 081234567890"
                                        className={`w-full h-12 bg-white/5 border rounded-xl px-4 text-gray-300 placeholder:text-gray-600 focus:outline-none transition-all ${errors.phone
                                            ? 'border-red-500/50 focus:border-red-500/70'
                                            : 'border-purple-500/20 focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                                            }`}
                                    />
                                    {errors.phone && <p className="text-xs text-red-400">{errors.phone}</p>}
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleChange('email', e.target.value)}
                                        placeholder="Alamat email..."
                                        className="w-full h-12 bg-white/5 border border-purple-500/20 rounded-xl px-4 text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all"
                                    />
                                </div>

                                {/* Address */}
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Alamat</label>
                                    <textarea
                                        value={formData.address}
                                        onChange={(e) => handleChange('address', e.target.value)}
                                        placeholder="Alamat lengkap..."
                                        rows={3}
                                        className="w-full bg-white/5 border border-purple-500/20 rounded-xl px-4 py-3 text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all resize-none"
                                    />
                                </div>

                                {/* Footer */}
                                <div className="p-6 border-t border-purple-500/20 flex gap-3 -mx-6 mb-[-24px]">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        disabled={isSubmitting}
                                        className="flex-1 h-12 rounded-xl border border-purple-500/30 text-gray-400 hover:text-gray-200 hover:border-purple-500/50 transition-all cursor-pointer disabled:opacity-50"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all font-semibold cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Menyimpan...
                                            </>
                                        ) : (
                                            'Simpan'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
