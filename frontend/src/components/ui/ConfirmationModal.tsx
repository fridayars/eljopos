import { X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { ReactNode } from 'react';

export type ConfirmationTheme = 'danger' | 'warning' | 'info' | 'primary';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description?: ReactNode;
    confirmText?: string;
    cancelText?: string;
    icon: React.ElementType;
    theme?: ConfirmationTheme;
    isLoading?: boolean;
}

const themeStyles = {
    danger: {
        border: 'border-red-500/30',
        shadow: 'shadow-[0_0_60px_rgba(239,68,68,0.2)]',
        gradientStart: 'from-red-500/20',
        iconBg: 'bg-red-500/20',
        iconBorder: 'border-red-500/40',
        iconColor: 'text-red-400',
        buttonBg: 'bg-gradient-to-r from-red-600 to-red-700 hover:shadow-[0_0_25px_rgba(239,68,68,0.5)]',
        contentBg: 'bg-red-500/10',
        contentBorder: 'border-red-500/20',
    },
    warning: {
        border: 'border-yellow-500/30',
        shadow: 'shadow-[0_0_60px_rgba(234,179,8,0.2)]',
        gradientStart: 'from-yellow-500/20',
        iconBg: 'bg-yellow-500/20',
        iconBorder: 'border-yellow-500/40',
        iconColor: 'text-yellow-400',
        buttonBg: 'bg-gradient-to-r from-yellow-600 to-yellow-700 hover:shadow-[0_0_25px_rgba(234,179,8,0.5)]',
        contentBg: 'bg-yellow-500/10',
        contentBorder: 'border-yellow-500/20',
    },
    info: {
        border: 'border-cyan-500/30',
        shadow: 'shadow-[0_0_60px_rgba(6,182,212,0.2)]',
        gradientStart: 'from-cyan-500/20',
        iconBg: 'bg-cyan-500/20',
        iconBorder: 'border-cyan-500/40',
        iconColor: 'text-cyan-400',
        buttonBg: 'bg-gradient-to-r from-cyan-600 to-cyan-700 hover:shadow-[0_0_25px_rgba(6,182,212,0.5)]',
        contentBg: 'bg-cyan-500/10',
        contentBorder: 'border-cyan-500/20',
    },
    primary: {
        border: 'border-purple-500/30',
        shadow: 'shadow-[0_0_60px_rgba(139,92,246,0.2)]',
        gradientStart: 'from-purple-500/20',
        iconBg: 'bg-purple-500/20',
        iconBorder: 'border-purple-500/40',
        iconColor: 'text-purple-400',
        buttonBg: 'bg-gradient-to-r from-purple-600 to-purple-700 hover:shadow-[0_0_25px_rgba(139,92,246,0.5)]',
        contentBg: 'bg-purple-500/10',
        contentBorder: 'border-purple-500/20',
    }
};

export function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Konfirmasi',
    cancelText = 'Batal',
    icon: Icon,
    theme = 'primary',
    isLoading = false
}: ConfirmationModalProps) {
    if (!isOpen) return null;

    const styles = themeStyles[theme];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={isLoading ? undefined : onClose}
                className="fixed inset-0 bg-black/70 backdrop-blur-md z-[60] flex items-center justify-center p-4"
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 30 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className={`bg-[#12121a] border ${styles.border} rounded-2xl ${styles.shadow} w-full max-w-md overflow-hidden relative`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Visual Warning Header */}
                    <div className="relative overflow-hidden">
                        <div className={`absolute inset-0 bg-gradient-to-b ${styles.gradientStart} to-transparent`} />
                        <div className="relative flex flex-col items-center pt-8 pb-4 px-6 z-10">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.1, type: 'spring', stiffness: 400, damping: 20 }}
                                className={`w-16 h-16 rounded-full ${styles.iconBg} border-2 ${styles.iconBorder} flex items-center justify-center mb-4`}
                            >
                                <Icon className={`w-8 h-8 ${styles.iconColor}`} />
                            </motion.div>
                            <h3 className="text-xl text-gray-100 font-semibold mb-1 text-center">{title}</h3>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="px-6 pb-4">
                        <div className={`${styles.contentBg} border ${styles.contentBorder} rounded-xl p-4 min-h-[4rem] flex items-center justify-center text-center`}>
                            {typeof description === 'string' ? (
                                <p className="text-sm text-gray-300">
                                    {description}
                                </p>
                            ) : (
                                description
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="px-6 pb-6 flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 px-4 py-3 rounded-xl border border-gray-600/50 text-gray-400 hover:text-gray-200 hover:border-gray-500 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`flex-1 px-4 py-3 rounded-xl ${styles.buttonBg} text-white transition-all text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed`}
                        >
                            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {confirmText}
                        </button>
                    </div>

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-500 hover:text-gray-300 transition-all z-20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
