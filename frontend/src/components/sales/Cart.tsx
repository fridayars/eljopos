import { useState, useEffect } from 'react'
import { Minus, Plus, Trash2, X, Percent } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { CustomerSelector } from './CustomerSelector'
import type { Customer } from '../../services/customerService'
import { getAllActiveStaff, type Staff } from '../../services/staffService'

export interface CartItem {
    id: string
    name: string
    price: number
    quantity: number
    item_type: 'product' | 'layanan'
    kategori_name: string
    discount_type: '%' | 'Rp'
    discount_value: number
    staff_id?: string
}

interface CartProps {
    items: CartItem[]
    selectedCustomer: Customer | null
    discountType: '%' | 'Rp'
    discountValue: number
    onUpdateQuantity: (id: string, quantity: number) => void
    onRemoveItem: (id: string) => void
    onUpdateItemDiscount: (id: string, discountType: '%' | 'Rp', discountValue: number) => void
    onUpdateItemStaff: (id: string, staffId: string) => void
    onSelectCustomer: () => void
    onRemoveCustomer: () => void
    onAddNewCustomer: () => void
    onDiscountTypeChange: (type: '%' | 'Rp') => void
    onDiscountValueChange: (value: number) => void
    onCheckout: () => void
    onClear: () => void
    isOpen?: boolean
    onClose?: () => void
    isLoading?: boolean
}

// Helper: hitung subtotal per item setelah diskon item
function getItemSubtotal(item: CartItem): number {
    const gross = item.price * item.quantity
    if (!item.discount_value) return gross
    const disc = item.discount_type === '%'
        ? (gross * item.discount_value) / 100
        : item.discount_value
    return Math.max(0, gross - disc)
}

export function Cart({
    items,
    selectedCustomer,
    discountType,
    discountValue,
    onUpdateQuantity,
    onRemoveItem,
    onUpdateItemDiscount,
    onUpdateItemStaff,
    onSelectCustomer,
    onRemoveCustomer,
    onAddNewCustomer,
    onDiscountTypeChange,
    onDiscountValueChange,
    onCheckout,
    onClear,
    isOpen = true,
    onClose,
    isLoading = false,
}: CartProps) {
    const [activeStaffList, setActiveStaffList] = useState<Staff[]>([])

    useEffect(() => {
        const fetchStaff = async () => {
            const res = await getAllActiveStaff()
            if (res.success && res.data) {
                setActiveStaffList(res.data)
            }
        }
        fetchStaff()
    }, [])

    // subtotal = akumulasi setelah diskon per item
    const subtotal = items.reduce((sum, item) => sum + getItemSubtotal(item), 0)

    const discountAmount = discountType === '%' ? (subtotal * discountValue) / 100 : discountValue

    const grandTotal = Math.max(0, subtotal - discountAmount)

    // Check if any layanan item is missing a staff assignment
    const hasLayananWithoutStaff = items.some(item => item.item_type === 'layanan' && !item.staff_id)

    const CartContent = (
        <>
            {/* Header */}
            <div className="px-4 py-3 border-b border-purple-500/20 shrink-0">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg md:text-xl text-gray-200">Pesanan Saat Ini</h2>
                        <p className="text-xs md:text-sm text-gray-500 mt-1">{items.length} items</p>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="xl:hidden w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Customer Information */}
            <div className="px-4 py-3 border-b border-purple-500/20 shrink-0">
                <CustomerSelector
                    selectedCustomer={selectedCustomer}
                    onSelectCustomer={onSelectCustomer}
                    onRemoveCustomer={onRemoveCustomer}
                    onAddNewCustomer={onAddNewCustomer}
                />
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2 md:space-y-3">
                <AnimatePresence mode="popLayout">
                    {items.map((item) => (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8, x: 100 }}
                            className="bg-white/5 border border-purple-500/20 rounded-xl p-3 md:p-4"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm text-gray-200 line-clamp-1">{item.name}</h3>
                                    <p className="text-xs text-blue-400 mt-1">Rp {item.price.toLocaleString('id-ID')}</p>
                                </div>
                                <button
                                    onClick={() => onRemoveItem(item.id)}
                                    className="text-gray-500 hover:text-red-400 transition-colors ml-2 min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2 cursor-pointer"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
                                    <button
                                        onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                        className="w-9 h-9 md:w-10 md:h-10 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 flex items-center justify-center transition-colors cursor-pointer"
                                    >
                                        <Minus className="w-3 h-3 md:w-4 md:h-4" />
                                    </button>
                                    <span className="w-10 text-center text-sm text-gray-300">{item.quantity}</span>
                                    <button
                                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                        className="w-9 h-9 md:w-10 md:h-10 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 flex items-center justify-center transition-colors cursor-pointer"
                                    >
                                        <Plus className="w-3 h-3 md:w-4 md:h-4" />
                                    </button>
                                </div>
                                <div className="text-right">
                                    {item.discount_value > 0 && (
                                        <p className="text-xs text-gray-500 line-through">
                                            Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                                        </p>
                                    )}
                                    <p className="text-sm text-gray-200">
                                        Rp {getItemSubtotal(item).toLocaleString('id-ID')}
                                    </p>
                                </div>
                            </div>

                            {/* Per-item Discount */}
                            <div className="flex flex-col gap-1 pt-2 border-t border-purple-500/10">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500 shrink-0">Diskon:</span>
                                    <div className="flex gap-1 p-0.5 bg-white/5 rounded-lg shrink-0">
                                        <button
                                            onClick={() => onUpdateItemDiscount(item.id, '%', item.discount_value)}
                                            className={`w-7 h-7 rounded flex items-center justify-center transition-all cursor-pointer ${
                                                item.discount_type === '%'
                                                    ? 'bg-purple-500/40 text-purple-200 shadow-[0_0_8px_rgba(168,85,247,0.4)]'
                                                    : 'text-gray-500 hover:text-gray-300'
                                            }`}
                                            title="Persen"
                                        >
                                            <Percent className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() => onUpdateItemDiscount(item.id, 'Rp', item.discount_value)}
                                            className={`w-7 h-7 rounded flex items-center justify-center transition-all cursor-pointer text-[10px] font-semibold ${
                                                item.discount_type === 'Rp'
                                                    ? 'bg-blue-500/40 text-blue-200 shadow-[0_0_8px_rgba(59,130,246,0.4)]'
                                                    : 'text-gray-500 hover:text-gray-300'
                                            }`}
                                            title="Nominal"
                                        >
                                            Rp
                                        </button>
                                    </div>
                                    <input
                                        type="number"
                                        value={item.discount_value || ''}
                                        onChange={(e) => {
                                            const raw = e.target.value
                                            const parsed = raw === '' ? 0 : parseFloat(raw)
                                            if (!isNaN(parsed)) onUpdateItemDiscount(item.id, item.discount_type, parsed)
                                        }}
                                        onFocus={(e) => e.target.select()}
                                        placeholder="0"
                                        min="0"
                                        className="flex-1 h-7 bg-white/5 border border-purple-500/20 rounded-lg px-2 text-gray-300 text-xs focus:outline-none focus:border-purple-500/50 transition-all"
                                    />
                                </div>
                                {item.discount_type === '%' && item.discount_value > 0 && (
                                    <span className="text-xs text-emerald-400 pl-1">
                                        = -{`Rp ${Math.min(Math.round(item.price * item.quantity * item.discount_value / 100), item.price * item.quantity).toLocaleString('id-ID')}`}
                                    </span>
                                )}
                            </div>

                            {/* Staff Selection for Layanan */}
                            {item.item_type === 'layanan' && (
                                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-purple-500/10">
                                    <span className="text-xs text-gray-500 shrink-0">Teknisi:</span>
                                    <select
                                        value={item.staff_id || ''}
                                        onChange={(e) => onUpdateItemStaff(item.id, e.target.value)}
                                        className={`flex-1 h-8 bg-white/5 border rounded-lg px-2 text-xs focus:outline-none transition-all cursor-pointer ${!item.staff_id
                                            ? 'border-red-500/50 text-red-300 focus:border-red-500'
                                            : 'border-purple-500/20 text-gray-300 focus:border-purple-500/50'
                                        }`}
                                    >
                                        <option value="" className="bg-[#1a1625] text-gray-500">Pilih Teknisi</option>
                                        {activeStaffList.map(staff => (
                                            <option key={staff.id} value={staff.id} className="bg-[#1a1625] text-gray-200">
                                                {staff.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                        </motion.div>
                    ))}
                </AnimatePresence>

                {items.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 py-12">
                        <p className="text-sm">Keranjang kosong</p>
                        <p className="text-xs mt-1">Tambahkan produk untuk memulai pesanan</p>
                    </div>
                )}
            </div>

            {/* Summary */}
            <div className="px-4 py-3 border-t border-purple-500/20 space-y-2 shrink-0">
                {/* Subtotal */}
                <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Subtotal</span>
                    <span className="text-gray-200">Rp {subtotal.toLocaleString('id-ID')}</span>
                </div>

                {/* Discount */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Diskon</span>
                        <div className="flex gap-1 p-1 bg-white/5 rounded-lg">
                            <button
                                onClick={() => onDiscountTypeChange('%')}
                                className={`px-3 py-1 rounded text-xs transition-all min-h-[36px] cursor-pointer ${discountType === '%'
                                        ? 'bg-gradient-to-r from-blue-500/30 to-purple-600/30 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                                        : 'text-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                %
                            </button>
                            <button
                                onClick={() => onDiscountTypeChange('Rp')}
                                className={`px-3 py-1 rounded text-xs transition-all min-h-[36px] cursor-pointer ${discountType === 'Rp'
                                        ? 'bg-gradient-to-r from-blue-500/30 to-purple-600/30 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                                        : 'text-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                Rp
                            </button>
                        </div>
                    </div>
                    <input
                        type="number"
                        value={discountValue || ''}
                        onChange={(e) => {
                            const raw = e.target.value
                            if (raw === '' || raw === '-') {
                                onDiscountValueChange(0)
                                return
                            }
                            const parsed = parseFloat(raw)
                            if (!isNaN(parsed)) onDiscountValueChange(parsed)
                        }}
                        onFocus={(e) => e.target.select()}
                        placeholder="0"
                        min="0"
                        className="w-full h-11 md:h-12 bg-white/5 border border-purple-500/20 rounded-lg px-4 text-gray-300 text-sm focus:outline-none focus:border-blue-500/50 transition-all"
                    />
                    {discountAmount > 0 && (
                        <p className="text-xs text-cyan-400">-Rp {discountAmount.toLocaleString('id-ID')}</p>
                    )}
                </div>

                {/* Grand Total */}
                <div className="pt-3 md:pt-4 border-t border-purple-500/20">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-400 text-sm md:text-base">Total Akhir</span>
                        <div className="text-xl md:text-2xl bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent font-semibold">
                            Rp {grandTotal.toLocaleString('id-ID')}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 md:gap-3">
                        <button
                            onClick={onClear}
                            disabled={items.length === 0 || isLoading}
                            className="flex-1 h-11 md:h-12 rounded-xl border border-purple-500/30 text-gray-400 hover:text-gray-200 hover:border-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            onClick={onCheckout}
                            disabled={items.length === 0 || !selectedCustomer || isLoading || hasLayananWithoutStaff}
                            className="flex-1 h-11 md:h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base cursor-pointer"
                        >
                            {isLoading ? 'Memproses...' : 'Bayar'}
                        </button>
                    </div>
                    {items.length > 0 && !selectedCustomer && (
                        <p className="text-[10px] md:text-xs text-red-400 text-center mt-2 animate-pulse font-medium">
                            * Silakan pilih customer terlebih dahulu untuk melanjutkan pembayaran
                        </p>
                    )}
                    {hasLayananWithoutStaff && (
                        <p className="text-[10px] md:text-xs text-red-400 text-center mt-2 animate-pulse font-medium">
                            * Silakan pilih teknisi untuk setiap item layanan
                        </p>
                    )}
                </div>
            </div>
        </>
    )

    return (
        <>
            {/* Desktop - Fixed Sidebar */}
            <div className="hidden xl:flex w-[440px] h-full bg-white/5 backdrop-blur-xl border-l border-purple-500/20 flex-col">
                {CartContent}
            </div>

            {/* Mobile/Tablet - Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="xl:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="xl:hidden fixed right-0 top-0 bottom-0 w-full sm:w-[440px] backdrop-blur-xl border-l border-purple-500/20 flex flex-col z-50" style={{ background: 'var(--background)' }}
                        >
                            {CartContent}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}
