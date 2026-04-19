import { motion, AnimatePresence } from 'motion/react'
import { X, Calendar, Wallet, Plus, Trash2 } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

function PaymentMethodSelect({
    value,
    onChange
}: {
    value: string;
    onChange: (val: string) => void;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const options = [
        { label: 'Cash', value: 'CASH' },
        { label: 'Transfer BCA', value: 'TRANSFER_BCA' }
    ];

    const selectedOption = options.find(o => o.value === value);

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`h-10 bg-black/40 border rounded-lg px-3 text-sm flex items-center justify-between cursor-pointer focus:outline-none transition-all ${
                    isOpen ? 'border-primary shadow-[0_0_0_2px_rgba(59,130,246,0.15)]' : 'border-purple-500/20 hover:border-purple-500/40'
                }`}
                style={{
                    color: value ? 'var(--foreground)' : 'var(--muted-foreground)',
                    borderColor: isOpen ? 'var(--primary)' : undefined,
                }}
            >
                <span className="text-gray-300">{selectedOption?.label || 'Pilih Metode'}</span>
                <span className={`text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                </span>
            </div>

            {isOpen && (
                <div
                    className="absolute left-0 right-0 top-[calc(100%+4px)] py-1 rounded-lg z-[60] overflow-hidden shadow-2xl animate-[fadeIn_0.15s_ease-out]"
                    style={{
                        background: 'var(--card)',
                        border: '1px solid var(--border)',
                    }}
                >
                    <ul className="max-h-60 overflow-y-auto">
                        {options.map((option) => (
                            <li
                                key={option.value}
                                className="px-3 py-2 text-sm cursor-pointer transition-colors"
                                style={{
                                    color: value === option.value ? 'var(--primary)' : 'var(--foreground)',
                                    background: value === option.value ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
                                }}
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                onMouseEnter={(e) => {
                                    if (value !== option.value) e.currentTarget.style.background = 'var(--surface-subtle)';
                                }}
                                onMouseLeave={(e) => {
                                    if (value !== option.value) e.currentTarget.style.background = 'transparent';
                                }}
                            >
                                {option.label}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

interface Payment {
    method: string
    amount: number
}

interface PaymentModalProps {
    isOpen: boolean
    onClose: () => void
    grandTotal: number
    canChangeDate?: boolean
    onConfirm: (data: { date: string; cashbox: string; cashPaid: number; payments: Payment[] }) => void
}

export function PaymentModal({ isOpen, onClose, grandTotal, canChangeDate = false, onConfirm }: PaymentModalProps) {
    const [date, setDate] = useState('')
    const [payments, setPayments] = useState<Payment[]>([
        { method: 'CASH', amount: 0 }
    ])

    const today = new Date().toISOString().split('T')[0]

    useEffect(() => {
        // Set current date and reset payments when modal opens
        if (isOpen) {
            setDate(today)
            setPayments([{ method: 'CASH', amount: grandTotal }])
        }
    }, [isOpen, grandTotal])

    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)
    const change = Math.max(0, totalPaid - grandTotal)
    const isValid = totalPaid >= grandTotal

    const handleConfirm = () => {
        if (isValid) {
            // Append current time to the selected date so it doesn't default to 00:00:00
            const now = new Date()
            const timeString = now.toTimeString().split(' ')[0] // HH:mm:ss
            const finalDate = `${date} ${timeString}`

            // Flatten to first method for simple legacy handling if needed, 
            // but return full payments array for advanced split payment logic
            onConfirm({
                date: finalDate,
                cashbox: payments[0].method,
                cashPaid: totalPaid,
                payments
            })
        }
    }

    const addPaymentMethod = () => {
        if (payments.length < 2) {
            const currentTotal = payments.reduce((sum, p) => sum + p.amount, 0)
            const remaining = Math.max(0, grandTotal - currentTotal)
            setPayments([...payments, { method: 'TRANSFER_BCA', amount: remaining }])
        }
    }

    const removePaymentMethod = (index: number) => {
        setPayments(payments.filter((_, i) => i !== index))
    }

    const updatePayment = (index: number, field: keyof Payment, value: string | number) => {
        setPayments(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p))
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
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full md:max-w-lg max-h-[90vh] flex flex-col pointer-events-auto"
                        >
                            <div className="backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-[0_0_50px_rgba(59,130,246,0.3)] overflow-hidden flex flex-col h-full w-full" style={{ background: 'var(--background)' }}>
                            {/* Header */}
                            <div className="relative p-4 md:p-6 border-b border-purple-500/20 shrink-0">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-600/10" />
                                <div className="relative flex items-center justify-between">
                                    <h2 className="text-lg md:text-xl text-gray-200">Pembayaran</h2>
                                    <button
                                        onClick={onClose}
                                        className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6">
                                {/* Grand Total Display */}
                                <div className="bg-gradient-to-r from-blue-500/10 to-purple-600/10 border border-blue-500/30 rounded-xl p-4 md:p-5">
                                    <p className="text-xs md:text-sm text-gray-400 mb-2">Total Tagihan</p>
                                    <div className="text-2xl md:text-3xl bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent font-bold">
                                        Rp {grandTotal.toLocaleString('id-ID')}
                                    </div>
                                </div>

                                {/* Date */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm text-gray-400">
                                        <Calendar className="w-4 h-4" />
                                        Tanggal Transaksi
                                        {!canChangeDate && (
                                            <span className="text-xs text-gray-600">(terkunci)</span>
                                        )}
                                    </label>
                                    <input
                                        type="date"
                                        value={date}
                                        max={today}
                                        onChange={(e) => {
                                            if (canChangeDate) setDate(e.target.value)
                                        }}
                                        disabled={!canChangeDate}
                                        className={`w-full h-11 md:h-12 border border-purple-500/20 rounded-xl px-4 text-gray-300 focus:outline-none focus:border-blue-500/50 transition-all ${
                                            canChangeDate
                                                ? 'bg-white/5 cursor-pointer'
                                                : 'bg-white/[0.02] opacity-60 cursor-not-allowed'
                                        }`}
                                    />
                                </div>

                                {/* Payments List */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm text-gray-400 flex items-center gap-2">
                                            <Wallet className="w-4 h-4" />
                                            Metode Pembayaran
                                        </label>
                                        {payments.length < 2 && (
                                            <button
                                                onClick={addPaymentMethod}
                                                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors px-2 py-1 bg-blue-500/10 rounded-lg border border-blue-500/20"
                                            >
                                                <Plus className="w-3 h-3" />
                                                Tambah Splıt
                                            </button>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        {payments.map((payment, index) => (
                                            <div key={index} className="flex gap-2 items-start">
                                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-white/5 border border-purple-500/10 rounded-xl relative group">
                                                    <PaymentMethodSelect
                                                        value={payment.method}
                                                        onChange={(val) => updatePayment(index, 'method', val)}
                                                    />
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">Rp</span>
                                                        <input
                                                            type="number"
                                                            value={payment.amount || ''}
                                                            onChange={(e) => updatePayment(index, 'amount', Number(e.target.value))}
                                                            className="w-full h-10 bg-black/40 border border-purple-500/20 rounded-lg pl-8 pr-3 text-sm text-gray-300 focus:outline-none focus:border-blue-500/40"
                                                            placeholder="0"
                                                        />
                                                    </div>

                                                    {index > 0 && (
                                                        <button
                                                            onClick={() => removePaymentMethod(index)}
                                                            className="absolute -right-2 -top-2 w-6 h-6 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg cursor-pointer"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Change/Summary Display */}
                                <div className="space-y-3 pt-2">
                                    <div className="flex justify-between items-center px-1">
                                        <span className="text-sm text-gray-400">Total Dibayar</span>
                                        <span className={`text-sm font-semibold ${totalPaid >= grandTotal ? 'text-green-400' : 'text-orange-400'}`}>
                                            Rp {totalPaid.toLocaleString('id-ID')}
                                        </span>
                                    </div>

                                    {change > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="bg-green-500/10 border border-green-500/20 rounded-xl p-4"
                                        >
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-green-400/80">Kembalian</span>
                                                <span className="text-xl font-bold text-green-400">
                                                    Rp {change.toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                        </motion.div>
                                    )}

                                    {totalPaid < grandTotal && totalPaid > 0 && (
                                        <div className="px-4 py-2 border border-orange-500/20 bg-orange-500/5 rounded-lg text-center">
                                            <p className="text-xs text-orange-400/80">
                                                Kekurangan: Rp {(grandTotal - totalPaid).toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-4 md:p-6 border-t border-purple-500/20 flex gap-3 shrink-0">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 h-11 md:h-12 rounded-xl border border-purple-500/30 text-gray-400 hover:text-gray-200 hover:border-purple-500/50 transition-all text-sm md:text-base cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    onClick={handleConfirm}
                                    disabled={!isValid}
                                    className="flex-1 h-11 md:h-12 rounded-xl bg-gradient-to-r from-blue-400 to-purple-600 text-white hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all disabled:opacity-30 disabled:cursor-not-allowed text-sm md:text-base font-semibold cursor-pointer"
                                >
                                    Selesaikan Order
                                </button>
                            </div>
                        </div>
                    </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}
