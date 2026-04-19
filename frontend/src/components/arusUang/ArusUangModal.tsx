import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Save, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import { arusUangService } from '../../services/arusUangService'

interface ArusUangModalProps {
    isOpen: boolean
    onClose: () => void
    type: 'IN' | 'OUT'
    onSuccess: () => void
}

export function ArusUangModal({ isOpen, onClose, type, onSuccess }: ArusUangModalProps) {
    const [amount, setAmount] = useState('')
    const [paymentMethod, setPaymentMethod] = useState('CASH')
    const [description, setDescription] = useState('')
    const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
    const [isSaving, setIsSaving] = useState(false)

    const [userPermissions] = useState<string[]>(() => {
        try {
            const token = localStorage.getItem('token')
            if (token) {
                const payload = JSON.parse(atob(token.split('.')[1]))
                return payload.permissions || []
            }
        } catch {
            return []
        }
        return []
    })

    const canChangeDate = userPermissions.includes('arusuang.changedate')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!amount || !description || !date) return

        setIsSaving(true)
        try {
            await arusUangService.createManual({
                type,
                payment_method: paymentMethod,
                amount: parseFloat(amount),
                description,
                date
            })
            onSuccess()
        } catch (error: any) {
            alert(error?.response?.data?.message || 'Terjadi kesalahan saat menyimpan data')
        } finally {
            setIsSaving(false)
        }
    }

    if (!isOpen) return null

    const titleColor = type === 'IN' ? 'text-emerald-400' : 'text-red-400'
    const TitleIcon = type === 'IN' ? ArrowDownCircle : ArrowUpCircle
    const titleText = type === 'IN' ? 'Tambah Pemasukan Manual' : 'Tambah Pengeluaran Manual'

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
                    className="relative w-full max-w-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                    style={{ background: 'var(--surface-modal)' }}
                >
                    <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
                        <div className="flex items-center gap-3">
                            <TitleIcon className={`w-6 h-6 ${titleColor}`} />
                            <h2 className="text-lg font-bold text-white">
                                {titleText}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6">
                        <form id="arusUangForm" onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>
                                    Tanggal <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                    disabled={!canChangeDate}
                                    className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${!canChangeDate ? 'opacity-60 cursor-not-allowed' : ''}`}
                                    style={{ background: 'var(--surface-subtle)', borderColor: 'var(--border-subtle)', color: 'var(--foreground)' }}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>
                                    Metode Pembayaran <span className="text-red-400">*</span>
                                </label>
                                <select
                                    required
                                    value={paymentMethod}
                                    onChange={e => setPaymentMethod(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    style={{ background: 'var(--surface-subtle)', borderColor: 'var(--border-subtle)', color: 'var(--foreground)' }}
                                >
                                    <option value="CASH">Tunai (Cash)</option>
                                    <option value="TRANSFER_BCA">Transfer BCA</option>
                                    {/* You can add more mappings here later */}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>
                                    Nominal (Rp) <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    placeholder="Contoh: 50000"
                                    className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    style={{ background: 'var(--surface-subtle)', borderColor: 'var(--border-subtle)', color: 'var(--foreground)' }}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>
                                    Keterangan <span className="text-red-400">*</span>
                                </label>
                                <textarea
                                    required
                                    rows={3}
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="Keterangan peruntukan dana..."
                                    className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                                    style={{ background: 'var(--surface-subtle)', borderColor: 'var(--border-subtle)', color: 'var(--foreground)' }}
                                />
                            </div>
                        </form>
                    </div>

                    <div className="p-6 border-t border-white/5 bg-white/[0.02] flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium border border-white/10 rounded-xl transition-all"
                            style={{ color: 'var(--muted-foreground)', background: 'var(--surface-subtle)' }}
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            form="arusUangForm"
                            disabled={isSaving}
                            className={`px-6 py-2 text-sm font-medium text-white rounded-xl transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                                type === 'IN' 
                                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500' 
                                    : 'bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-400 hover:to-orange-500'
                            }`}
                        >
                            <Save className="w-4 h-4" />
                            {isSaving ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
