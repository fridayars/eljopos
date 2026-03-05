import { X, ArrowRightLeft, Plus, Minus, Trash2, Search } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useState } from 'react'
import type { ProductItem } from '../../services/productService'
import type { Branch } from '../../services/branchService'

interface TransferQueueItem {
    id: string
    productId: string
    productName: string
    productSku: string
    productImage: string
    quantity: number
}

interface StockTransferModalProps {
    isOpen: boolean
    onClose: () => void
    products: ProductItem[]
    branches: Branch[]
    onTransfer: (data: { sourceBranch: string; destinationBranch: string; items: TransferQueueItem[] }) => void
}

export function StockTransferModal({ isOpen, onClose, products, branches, onTransfer }: StockTransferModalProps) {
    const [sourceBranch, setSourceBranch] = useState('')
    const [destinationBranch, setDestinationBranch] = useState('')
    const [selectedProduct, setSelectedProduct] = useState('')
    const [quantity, setQuantity] = useState(1)
    const [transferQueue, setTransferQueue] = useState<TransferQueueItem[]>([])
    const [productSearch, setProductSearch] = useState('')
    const [showProductDropdown, setShowProductDropdown] = useState(false)

    // Filter ONLY physical products that can have stock
    const physicalProducts = products.filter((p) => p.item_type === 'product')

    const filteredProducts = physicalProducts.filter(
        (product) =>
            product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
            product.sku.toLowerCase().includes(productSearch.toLowerCase()),
    )

    const getAvailableStock = (): number => {
        if (!selectedProduct || !sourceBranch) return 0
        const product = products.find((p) => p.id === selectedProduct)
        return product ? product.stock : 0
    }

    const availableStock = getAvailableStock()

    const resetProductForm = () => {
        setSelectedProduct('')
        setProductSearch('')
        setQuantity(1)
        setShowProductDropdown(false)
    }

    const handleProductSelect = (productId: string) => {
        setSelectedProduct(productId)
        const product = products.find((p) => p.id === productId)
        if (product) {
            setProductSearch(`${product.name} - ${product.sku}`)
        }
        setShowProductDropdown(false)
        setQuantity(1)
    }

    const handleAddToQueue = () => {
        if (!selectedProduct || quantity <= 0 || !sourceBranch) return

        if (quantity > availableStock) {
            alert(`Tidak bisa transfer lebih dari stok tersedia (${availableStock} unit)`)
            return
        }

        const product = products.find((p) => p.id === selectedProduct)
        if (!product) return

        const queueItem: TransferQueueItem = {
            id: Date.now().toString(),
            productId: product.id,
            productName: product.name,
            productSku: product.sku,
            productImage: product.image,
            quantity,
        }

        setTransferQueue((prev) => [...prev, queueItem])
        resetProductForm()
    }

    const handleRemoveFromQueue = (id: string) => {
        setTransferQueue((prev) => prev.filter((item) => item.id !== id))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!sourceBranch || !destinationBranch || transferQueue.length === 0) return

        if (sourceBranch === destinationBranch) {
            alert('Cabang asal dan tujuan tidak boleh sama')
            return
        }

        onTransfer({
            sourceBranch,
            destinationBranch,
            items: transferQueue,
        })

        handleClose()
    }

    const handleClose = () => {
        setSourceBranch('')
        setDestinationBranch('')
        setTransferQueue([])
        resetProductForm()
        onClose()
    }

    const incrementQuantity = () => {
        if (availableStock > 0 && quantity < availableStock) {
            setQuantity((prev) => prev + 1)
        }
    }
    const decrementQuantity = () => setQuantity((prev) => Math.max(1, prev - 1))

    const selectedProductData = products.find((p) => p.id === selectedProduct)

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-[#0F0F14]/95 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-[0_0_40px_rgba(139,92,246,0.3)] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                            {/* Header */}
                            <div className="p-6 border-b border-purple-500/20 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center">
                                        <ArrowRightLeft className="w-5 h-5 text-cyan-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl md:text-2xl text-gray-200">Transfer Stok</h2>
                                        <p className="text-sm text-gray-500 mt-1">Pindahkan jumlah stok antar cabang</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="w-10 h-10 rounded-lg bg-white/5 border border-purple-500/20 flex items-center justify-center text-gray-400 hover:text-gray-200 hover:border-red-500/50 transition-all cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
                                <div className="space-y-5">
                                    {/* Branch Selection */}
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {/* Source Branch */}
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Cabang Asal</label>
                                            <select
                                                value={sourceBranch}
                                                onChange={(e) => setSourceBranch(e.target.value)}
                                                className="w-full h-12 bg-white/5 border border-purple-500/20 rounded-xl px-4 text-gray-200 focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all"
                                                required
                                            >
                                                <option value="">Pilih cabang</option>
                                                {branches.map((branch) => (
                                                    <option key={branch.id} value={branch.id}>
                                                        {branch.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Destination Branch */}
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Cabang Tujuan</label>
                                            <select
                                                value={destinationBranch}
                                                onChange={(e) => setDestinationBranch(e.target.value)}
                                                className="w-full h-12 bg-white/5 border border-purple-500/20 rounded-xl px-4 text-gray-200 focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all"
                                                required
                                                disabled={!sourceBranch}
                                            >
                                                <option value="">Pilih tujuan</option>
                                                {branches
                                                    .filter((branch) => branch.id !== sourceBranch)
                                                    .map((branch) => (
                                                        <option key={branch.id} value={branch.id}>
                                                            {branch.name}
                                                        </option>
                                                    ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Product Selection */}
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Pilih Produk</label>
                                        <div className="relative">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                                            <input
                                                type="text"
                                                value={productSearch}
                                                onChange={(e) => setProductSearch(e.target.value)}
                                                onFocus={() => setShowProductDropdown(true)}
                                                onBlur={() => setTimeout(() => setShowProductDropdown(false), 200)}
                                                className="w-full h-12 bg-white/5 border border-purple-500/20 rounded-xl pl-12 pr-4 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all"
                                                placeholder="Cari produk fisik dari nama atau kode..."
                                                disabled={!sourceBranch}
                                            />
                                            {showProductDropdown && filteredProducts.length > 0 && (
                                                <div className="absolute top-full left-0 right-0 mt-2 bg-[#1A1A24] border border-purple-500/30 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.3)] max-h-60 overflow-y-auto z-10">
                                                    {filteredProducts.map((product) => (
                                                        <div
                                                            key={product.id}
                                                            className="px-4 py-3 cursor-pointer hover:bg-white/5 border-b border-purple-500/10 last:border-b-0 transition-colors text-gray-200"
                                                            onClick={() => handleProductSelect(product.id)}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <p className="text-sm">{product.name}</p>
                                                                    <p className="text-xs text-gray-500">
                                                                        SKU: {product.sku}
                                                                    </p>
                                                                </div>
                                                                <p className="text-xs text-blue-400">
                                                                    Stok Tersedia: {product.stock}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Selected Product Info */}
                                    {selectedProductData && (
                                        <div className="p-4 bg-white/5 border border-purple-500/20 rounded-xl">
                                            <div className="flex items-center gap-4">
                                                <img
                                                    src={selectedProductData.image}
                                                    alt={selectedProductData.name}
                                                    className="w-16 h-16 rounded-lg object-cover"
                                                />
                                                <div className="flex-1">
                                                    <p className="text-gray-200">{selectedProductData.name}</p>
                                                    <p className="text-sm text-gray-500">
                                                        Kode: {selectedProductData.sku}
                                                    </p>
                                                    <p className="text-sm text-blue-400">Tersedia: {availableStock} unit</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Quantity */}
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Jumlah Transfer</label>
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={decrementQuantity}
                                                className="w-12 h-12 rounded-xl bg-white/5 border border-purple-500/20 flex items-center justify-center text-gray-400 hover:text-gray-200 hover:border-blue-500/50 transition-all cursor-pointer"
                                            >
                                                <Minus className="w-5 h-5" />
                                            </button>
                                            <input
                                                type="number"
                                                value={quantity}
                                                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                                                className="flex-1 h-12 bg-white/5 border border-purple-500/20 rounded-xl px-4 text-center text-gray-200 focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all text-lg"
                                                min="1"
                                                max={availableStock}
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={incrementQuantity}
                                                className="w-12 h-12 rounded-xl bg-white/5 border border-purple-500/20 flex items-center justify-center text-gray-400 hover:text-gray-200 hover:border-blue-500/50 transition-all cursor-pointer"
                                            >
                                                <Plus className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Add to Queue */}
                                    <div>
                                        <button
                                            type="button"
                                            onClick={handleAddToQueue}
                                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all font-medium cursor-pointer"
                                        >
                                            <Plus className="w-5 h-5" />
                                            Tambahkan ke Daftar Antrean
                                        </button>
                                    </div>

                                    {/* Transfer Queue */}
                                    {transferQueue.length > 0 && (
                                        <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-600/10 border border-blue-500/30 rounded-xl">
                                            <p className="text-sm text-gray-400 mb-2">Antrean Transfer Sesi Ini</p>
                                            <div className="space-y-3">
                                                {transferQueue.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className="flex items-center justify-between text-gray-200 pb-2 border-b border-purple-500/10 last:border-0 last:pb-0"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <img
                                                                src={item.productImage}
                                                                alt={item.productName}
                                                                className="w-12 h-12 rounded-lg object-cover"
                                                            />
                                                            <div className="flex-1">
                                                                <p className="text-sm text-gray-200">
                                                                    {item.productName}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    SKU: {item.productSku}
                                                                </p>
                                                                <p className="text-xs text-cyan-400 mt-0.5">
                                                                    Jumlah: {item.quantity}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveFromQueue(item.id)}
                                                            className="w-8 h-8 rounded-lg bg-white/5 border border-purple-500/20 flex items-center justify-center text-gray-400 hover:text-gray-200 hover:border-red-500/50 hover:text-red-400 transition-all cursor-pointer"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </form>

                            {/* Footer */}
                            <div className="p-6 border-t border-purple-500/20 flex gap-3 justify-end shrink-0 bg-[#0F0F14]/90">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="px-6 py-2.5 rounded-xl border border-purple-500/30 text-gray-400 hover:text-gray-200 hover:border-purple-500/50 transition-all cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all font-medium cursor-pointer"
                                >
                                    <ArrowRightLeft className="w-5 h-5" />
                                    Eksekusi Transfer
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
