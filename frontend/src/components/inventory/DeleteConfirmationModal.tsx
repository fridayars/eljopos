import { AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemName: string;
}

export function DeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    itemName,
}: DeleteConfirmationModalProps) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/70 backdrop-blur-md z-[60] flex items-center justify-center p-4"
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 30 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="bg-[#12121a] border border-red-500/30 rounded-2xl shadow-[0_0_60px_rgba(239,68,68,0.2)] w-full max-w-md overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Visual Warning Header */}
                    <div className="relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-red-500/20 to-transparent" />
                        <div className="relative flex flex-col items-center pt-8 pb-4 px-6">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.1, type: 'spring', stiffness: 400, damping: 20 }}
                                className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500/40 flex items-center justify-center mb-4"
                            >
                                <AlertTriangle className="w-8 h-8 text-red-400" />
                            </motion.div>
                            <h3 className="text-xl text-gray-100 font-semibold mb-1">Hapus Layanan?</h3>
                            <p className="text-sm text-gray-400 text-center">
                                Tindakan ini tidak dapat dibatalkan
                            </p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="px-6 pb-4">
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                            <p className="text-sm text-gray-300 text-center">
                                Anda akan menghapus layanan{' '}
                                <span className="text-red-400 font-semibold">"{itemName}"</span>.{' '}
                                Layanan yang dihapus tidak akan muncul di daftar layanan.
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="px-6 pb-6 flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-xl border border-gray-600/50 text-gray-400 hover:text-gray-200 hover:border-gray-500 transition-all text-sm font-medium"
                        >
                            Batal
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white hover:shadow-[0_0_25px_rgba(239,68,68,0.5)] transition-all text-sm font-medium"
                        >
                            Ya, Hapus
                        </button>
                    </div>

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-500 hover:text-gray-300 transition-all"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
