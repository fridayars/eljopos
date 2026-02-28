import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useState } from 'react'

interface AddCategoryModalProps {
    isOpen: boolean
    onClose: () => void
    onAdd: (category: { name: string; description: string }) => void
}

export function AddCategoryModal({ isOpen, onClose, onAdd }: AddCategoryModalProps) {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) {
            setError('Nama kategori harus diisi')
            return
        }
        onAdd({ name, description })
        setName('')
        setDescription('')
        setError('')
        onClose()
    }

    const handleClose = () => {
        setName('')
        setDescription('')
        setError('')
        onClose()
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 cursor-default"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-[#0F0F14]/95 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-[0_0_40px_rgba(139,92,246,0.3)] w-full max-w-md overflow-hidden">
                            <div className="p-6 border-b border-purple-500/20 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl md:text-2xl text-gray-200">Tambah Kategori</h2>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="w-10 h-10 rounded-lg bg-white/5 border border-purple-500/20 flex items-center justify-center text-gray-400 hover:text-gray-200 hover:border-red-500/50 transition-all cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Nama Kategori *</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => {
                                            setName(e.target.value)
                                            if (error) setError('')
                                        }}
                                        autoFocus
                                        className={`w-full h-12 bg-white/5 border rounded-xl px-4 text-gray-200 placeholder:text-gray-600 focus:outline-none transition-all ${error
                                                ? 'border-red-500/50 focus:border-red-500/70'
                                                : 'border-purple-500/20 focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                                            }`}
                                        placeholder="Contoh: Makanan Berat"
                                    />
                                    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Deskripsi</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={3}
                                        className="w-full bg-white/5 border border-purple-500/20 rounded-xl p-4 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all resize-none"
                                        placeholder="Deskripsi singkat tentang kategori ini..."
                                    />
                                </div>

                                <div className="pt-4 flex gap-3 justify-end">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="px-6 py-2.5 rounded-xl border border-purple-500/30 text-gray-400 hover:text-gray-200 hover:border-purple-500/50 transition-all cursor-pointer"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all font-medium cursor-pointer"
                                    >
                                        Simpan
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
