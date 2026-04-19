import { motion, AnimatePresence } from 'motion/react'
import { CheckCircle2, Download, Plus, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'

interface TransactionSuccessModalProps {
    isOpen: boolean
    onClose: () => void
    transactionId: string
    invoiceNumber: string
    totalAmount: number
    customerName?: string
    customerPhone?: string
}

export function TransactionSuccessModal({
    isOpen,
    onClose,
    transactionId,
    invoiceNumber,
    totalAmount,
    customerName,
    customerPhone
}: TransactionSuccessModalProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value)
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-[0_0_40px_rgba(139,92,246,0.3)] w-full max-w-md overflow-hidden text-center p-8" style={{ background: 'var(--surface-modal)' }}>
                            <div className="flex justify-center mb-6">
                                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                                    <CheckCircle2 className="w-12 h-12 text-green-400" />
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold text-gray-200 mb-2">Transaksi Berhasil!</h2>
                            <p className="text-gray-400 mb-6">Invoice: <span className="text-cyan-400 font-medium">{invoiceNumber}</span></p>

                            <div className="bg-white/5 border border-purple-500/20 rounded-xl p-4 mb-8">
                                <p className="text-sm text-gray-500 mb-1">Total Pembayaran</p>
                                <p className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 font-black">
                                    {formatCurrency(totalAmount)}
                                </p>
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => {
                                        window.open(`/print-invoice/${transactionId}?cetak=true`, '_blank')
                                    }}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all font-bold"
                                >
                                    <Download className="w-5 h-5" />
                                    Cetak Invoice
                                </button>

                                <button
                                    onClick={() => {
                                        if (!customerPhone) {
                                            toast.error('Nomor telepon pelanggan tidak tersedia');
                                            return;
                                        }
                                        let phone = customerPhone.replace(/\D/g, '');
                                        if (phone.startsWith('0')) {
                                            phone = '62' + phone.substring(1);
                                        }
                                        const storeName = localStorage.getItem('store_name');
                                        const invoiceUrl = `${window.location.origin}/print-invoice/${transactionId}?cetak=false`;
                                        const text = encodeURIComponent(`Halo ${customerName || 'Pelanggan'},\n\nTerima kasih telah berbelanja di ${storeName}.\n\nBerikut adalah link nota Anda:\n${invoiceUrl}\n\nTerima kasih!`);
                                        window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
                                    }}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_30px_rgba(34,197,94,0.6)] transition-all font-bold"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    Kirim WhatsApp
                                </button>

                                <button
                                    onClick={onClose}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-purple-500/30 text-gray-300 hover:text-white hover:border-purple-500/50 hover:bg-purple-500/10 transition-all font-medium"
                                >
                                    <Plus className="w-5 h-5" />
                                    Transaksi Baru
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
