import { ChevronDown, User, UserPlus, UserMinus } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import type { Customer } from '../../services/customerService'

interface CustomerSelectorProps {
    selectedCustomer: Customer | null
    onSelectCustomer: () => void
    onRemoveCustomer: () => void
    onAddNewCustomer: () => void
}

export function CustomerSelector({
    selectedCustomer,
    onSelectCustomer,
    onRemoveCustomer,
    onAddNewCustomer,
}: CustomerSelectorProps) {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleAction = (action: () => void) => {
        action()
        setIsOpen(false)
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Customer Info Display */}
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/30 flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">Customer</p>
                    <motion.p
                        key={selectedCustomer?.id || 'walk-in'}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-gray-200 truncate"
                    >
                        {selectedCustomer?.name || 'Walk-in Customer'}
                    </motion.p>
                </div>

                {/* Split Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="px-3 py-2 rounded-lg border border-purple-500/30 text-gray-400 hover:text-blue-400 hover:border-blue-500/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all flex items-center gap-2 cursor-pointer"
                >
                    <span className="text-xs">Manage</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute right-0 top-full mt-2 w-56 bg-[#1A1A1F] backdrop-blur-xl border border-purple-500/30 rounded-xl shadow-[0_0_30px_rgba(59,130,246,0.2)] overflow-hidden z-50"
                    >
                        <div className="p-2 space-y-1">
                            <button
                                onClick={() => handleAction(onSelectCustomer)}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-blue-500/10 hover:text-blue-400 transition-all cursor-pointer"
                            >
                                <User className="w-4 h-4" />
                                Pilih Customer
                            </button>

                            {selectedCustomer && (
                                <button
                                    onClick={() => handleAction(onRemoveCustomer)}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-red-500/10 hover:text-red-400 transition-all cursor-pointer"
                                >
                                    <UserMinus className="w-4 h-4" />
                                    Hapus Customer
                                </button>
                            )}

                            <div className="h-px bg-purple-500/20 my-1" />

                            <button
                                onClick={() => handleAction(onAddNewCustomer)}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-blue-400 hover:bg-blue-500/10 transition-all cursor-pointer"
                            >
                                <UserPlus className="w-4 h-4" />
                                Tambah Customer Baru
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
