import { motion, AnimatePresence } from 'motion/react'
import { X, Search, Phone, Mail, Loader2 } from 'lucide-react'
import { useState, useEffect, useRef, useCallback } from 'react'
import { getCustomers, type Customer } from '../../services/customerService'

interface SelectCustomerModalProps {
    isOpen: boolean
    onClose: () => void
    onSelectCustomer: (customer: Customer) => void
}

export function SelectCustomerModal({
    isOpen,
    onClose,
    onSelectCustomer,
}: SelectCustomerModalProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [customers, setCustomers] = useState<Customer[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const listRef = useRef<HTMLDivElement>(null)
    const observerRef = useRef<IntersectionObserver | null>(null)
    const loadMoreRef = useRef<HTMLDivElement>(null)
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const ITEMS_PER_PAGE = 15

    // Fetch customers from API
    const fetchCustomers = useCallback(async (targetPage: number, search: string, reset: boolean = false) => {
        setIsLoading(true)
        try {
            const response = await getCustomers({
                page: targetPage,
                limit: ITEMS_PER_PAGE,
                search: search || undefined,
            })

            if (response.success) {
                const newItems = response.data.items
                setCustomers(prev => reset ? newItems : [...prev, ...newItems])
                setHasMore(response.data.pagination.has_next)
                setPage(targetPage)
            }
        } catch (error) {
            console.error('Error fetching customers:', error)
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Load initial data when modal opens
    useEffect(() => {
        if (isOpen) {
            setCustomers([])
            setPage(1)
            setHasMore(true)
            setSearchQuery('')
            fetchCustomers(1, '', true)
        }
    }, [isOpen, fetchCustomers])

    // Debounced search
    useEffect(() => {
        if (!isOpen) return

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current)
        }

        debounceTimerRef.current = setTimeout(() => {
            setCustomers([])
            setPage(1)
            setHasMore(true)
            fetchCustomers(1, searchQuery, true)
        }, 400)

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current)
            }
        }
    }, [searchQuery])

    // Infinite scroll observer
    useEffect(() => {
        if (!isOpen) return

        if (observerRef.current) {
            observerRef.current.disconnect()
        }

        observerRef.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoading) {
                    fetchCustomers(page + 1, searchQuery)
                }
            },
            { threshold: 0.1 }
        )

        if (loadMoreRef.current) {
            observerRef.current.observe(loadMoreRef.current)
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect()
            }
        }
    }, [isOpen, hasMore, isLoading, page, searchQuery, fetchCustomers])

    const handleSelect = (customer: Customer) => {
        onSelectCustomer(customer)
        onClose()
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
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] md:w-full max-w-2xl max-h-[80vh] z-50"
                    >
                        <div className="bg-[#0F0F14] backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-[0_0_50px_rgba(59,130,246,0.3)] overflow-hidden flex flex-col max-h-[80vh]">
                            {/* Header */}
                            <div className="relative p-6 border-b border-purple-500/20">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-600/10" />
                                <div className="relative flex items-center justify-between">
                                    <h2 className="text-xl text-gray-200">Pilih Customer</h2>
                                    <button
                                        onClick={onClose}
                                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Search Field */}
                                <div className="relative mt-4">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Cari nama, telp, atau email..."
                                        className="w-full h-12 bg-white/5 border border-purple-500/20 rounded-xl pl-11 pr-4 text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all"
                                    />
                                </div>
                            </div>

                            {/* Customer List */}
                            <div ref={listRef} className="flex-1 overflow-y-auto p-4">
                                {customers.length === 0 && !isLoading ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                                        <p className="text-sm">Customer tidak ditemukan</p>
                                        <p className="text-xs mt-1">Gunakan kata kunci pencarian yang lain</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {customers.map((customer) => (
                                            <motion.button
                                                key={customer.id}
                                                onClick={() => handleSelect(customer)}
                                                whileHover={{ scale: 1.01 }}
                                                whileTap={{ scale: 0.99 }}
                                                className="w-full p-4 bg-white/5 hover:bg-white/10 border border-purple-500/20 hover:border-blue-500/50 rounded-xl transition-all text-left group cursor-pointer"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-sm text-gray-200 mb-2 group-hover:text-blue-400 transition-colors">
                                                            {customer.name}
                                                        </h3>
                                                        <div className="flex flex-wrap gap-3 text-xs">
                                                            {customer.phone && (
                                                                <div className="flex items-center gap-1.5 text-gray-500">
                                                                    <Phone className="w-3.5 h-3.5" />
                                                                    {customer.phone}
                                                                </div>
                                                            )}
                                                            {customer.email && (
                                                                <div className="flex items-center gap-1.5 text-gray-500">
                                                                    <Mail className="w-3.5 h-3.5" />
                                                                    {customer.email}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="ml-4 px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-lg text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                        Pilih
                                                    </div>
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>
                                )}

                                {/* Infinite scroll trigger */}
                                <div ref={loadMoreRef} className="h-16 flex items-center justify-center">
                                    {isLoading && (
                                        <div className="flex items-center gap-2 text-purple-400">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span className="text-xs">Memuat...</span>
                                        </div>
                                    )}
                                    {!hasMore && customers.length > 0 && (
                                        <p className="text-xs text-gray-600 italic">Semua data telah dimuat</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
