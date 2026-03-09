import { X, ArrowRightLeft, Plus, Minus, Trash2, Search, Loader2, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useState, useEffect, useRef } from 'react'
import { getProducts, executeStockTransfer } from '../../services/productService'
import type { ProductItem } from '../../services/productService'
import type { Branch } from '../../services/branchService'
import { ConfirmationModal } from '../ui/ConfirmationModal'

interface TransferRow {
    id: string
    searchQuery: string
    searchResults: ProductItem[]
    showDropdown: boolean
    isSearchingSource: boolean

    sourceProduct: ProductItem | null
    destProduct: ProductItem | null
    isCheckingDest: boolean
    errorMessage?: string

    quantity: number
}

interface StockTransferModalProps {
    isOpen: boolean
    onClose: () => void
    products?: ProductItem[]
    branches: Branch[]
    onTransfer: (data: any) => void
}

export function StockTransferModal({ isOpen, onClose, branches, onTransfer }: StockTransferModalProps) {
    const [sourceBranch, setSourceBranch] = useState('')
    const [destinationBranch, setDestinationBranch] = useState('')
    const [rows, setRows] = useState<TransferRow[]>([])
    const [isExecuting, setIsExecuting] = useState(false)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setSourceBranch('')
            setSourceBranch('')
            setDestinationBranch('')
            setRows([createNewRow()])
            setIsExecuting(false)
            setIsConfirmOpen(false)
        }
    }, [isOpen])

    const createNewRow = (): TransferRow => ({
        id: Date.now().toString() + Math.random().toString(),
        searchQuery: '',
        searchResults: [],
        showDropdown: false,
        isSearchingSource: false,
        sourceProduct: null,
        destProduct: null,
        isCheckingDest: false,
        errorMessage: '',
        quantity: 1,
    })

    const handleAddRow = () => {
        if (!sourceBranch || !destinationBranch) {
            alert('Pilih Cabang Asal dan Tujuan terlebih dahulu')
            return
        }
        setRows([...rows, createNewRow()])
    }

    const handleRemoveRow = (id: string) => {
        if (rows.length === 1) {
            // If it's the last row, just reset it
            setRows([createNewRow()])
        } else {
            setRows(rows.filter((r) => r.id !== id))
        }
    }

    const updateRow = (id: string, updates: Partial<TransferRow>) => {
        setRows(prevRows => prevRows.map(r => r.id === id ? { ...r, ...updates } : r))
    }

    // Need a ref to store timeouts so we don't recreate them on every render
    const searchTimeouts = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

    const handleSearchSource = (id: string, query: string) => {
        // Update input immediately
        setRows(currentRows => currentRows.map(r =>
            r.id === id ? { ...r, searchQuery: query, showDropdown: true } : r
        ))

        if (!query.trim() || !sourceBranch) {
            setRows(currentRows => currentRows.map(r =>
                r.id === id ? { ...r, searchResults: [] } : r
            ))
            return
        }

        setRows(currentRows => currentRows.map(r =>
            r.id === id ? { ...r, isSearchingSource: true } : r
        ))

        // Clear previous timeout
        if (searchTimeouts.current[id]) {
            clearTimeout(searchTimeouts.current[id])
        }

        // Set debounce
        const timeoutId = setTimeout(async () => {
            try {
                const res = await getProducts({ search: query, store_id: sourceBranch, limit: 10, status: true })
                const physicalProducts = (res.data?.items || []).filter(p => !p.item_type || p.item_type === 'product')

                // Need to use functional update to avoid overwriting a newer query with an older result
                setRows(currentRows => currentRows.map(r =>
                    r.id === id ? {
                        ...r,
                        searchResults: physicalProducts,
                        isSearchingSource: false,
                        showDropdown: true
                    } : r
                ))
            } catch (error) {
                setRows(currentRows => currentRows.map(r =>
                    r.id === id ? { ...r, isSearchingSource: false } : r
                ))
            }
        }, 300)

        searchTimeouts.current[id] = timeoutId
    }

    const handleSelectSourceProduct = async (rowId: string, product: ProductItem) => {
        if (!destinationBranch) {
            alert('Pilih Cabang Tujuan terlebih dahulu')
            return
        }

        updateRow(rowId, {
            searchQuery: `${product.name} - ${product.sku}`,
            showDropdown: false,
            sourceProduct: product,
            isCheckingDest: true,
            errorMessage: '',
            quantity: 1
        })

        // Check if product exists in destination branch by SKU
        const res = await getProducts({ search: product.sku, store_id: destinationBranch, limit: 1, status: true })

        const destProducts = res.data?.items || []
        // We ensure exact SKU match
        const destProduct = destProducts.find(p => p.sku === product.sku)

        if (!destProduct) {
            updateRow(rowId, {
                // Do not clear searchQuery or sourceProduct, just mark destProduct as null and show error
                destProduct: null,
                isCheckingDest: false,
                errorMessage: `Produk dengan SKU ${product.sku} tidak ditemukan di cabang tujuan.`
            })
        } else {
            updateRow(rowId, {
                destProduct,
                isCheckingDest: false,
                errorMessage: ''
            })
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!sourceBranch || !destinationBranch) return

        if (sourceBranch === destinationBranch) {
            alert('Cabang asal dan tujuan tidak boleh sama')
            return
        }

        // Validate rows
        const validRows = rows.filter(r => r.sourceProduct && r.destProduct && r.quantity > 0)

        if (validRows.length === 0) {
            alert('Tidak ada item valid untuk ditransfer')
            return
        }

        for (const row of validRows) {
            if (row.quantity > (row.sourceProduct?.stock || 0)) {
                alert(`Kuantitas transfer untuk ${row.sourceProduct?.name || 'Produk'} melebihi stok asal.`)
                return
            }
        }

        setIsConfirmOpen(true)
    }

    const executeConfirmedTransfer = async () => {
        setIsExecuting(true)

        const validRows = rows.filter(r => r.sourceProduct && r.destProduct && r.quantity > 0)
        const itemsToTransfer = validRows.map(r => ({
            productId: r.sourceProduct!.id,
            productName: r.sourceProduct!.name, // Included for optimistic UI in parent
            quantity: r.quantity
        }))

        const res = await executeStockTransfer(sourceBranch, destinationBranch, itemsToTransfer)

        setIsExecuting(false)
        setIsConfirmOpen(false)

        if (res.success) {
            // Pass data to parent so it can refresh or show toast
            onTransfer({
                sourceBranch,
                destinationBranch,
                items: itemsToTransfer
            })
            onClose()
        } else {
            alert(res.message || 'Gagal mengeksekusi transfer')
        }
    }

    // Prevent clicking outside dropdowns from keeping them open
    const modalRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
                setRows(prev => prev.map(r => ({ ...r, showDropdown: false })))
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <>
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
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        >
                            <div ref={modalRef} className="bg-[#0F0F14]/95 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-[0_0_40px_rgba(139,92,246,0.3)] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
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
                                        onClick={onClose}
                                        className="w-10 h-10 rounded-lg bg-white/5 border border-purple-500/20 flex items-center justify-center text-gray-400 hover:text-gray-200 hover:border-red-500/50 transition-all cursor-pointer"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Form */}
                                <form id="transfer-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
                                    <div className="space-y-6">
                                        {/* Branch Selection */}
                                        <div className="grid md:grid-cols-2 gap-4 bg-white/5 p-4 rounded-xl border border-purple-500/20">
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-2">Cabang Asal</label>
                                                <select
                                                    value={sourceBranch}
                                                    onChange={(e) => {
                                                        setSourceBranch(e.target.value)
                                                        // Reset rows when branch changes to prevent invalid data
                                                        setRows([createNewRow()])
                                                    }}
                                                    className="w-full h-12 bg-[#1A1A24] border border-purple-500/20 rounded-xl px-4 text-gray-200 focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all"
                                                    required
                                                >
                                                    <option value="">Pilih cabang asal</option>
                                                    {branches.map((branch) => (
                                                        <option key={branch.id} value={branch.id}>
                                                            {branch.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm text-gray-400 mb-2">Cabang Tujuan</label>
                                                <select
                                                    value={destinationBranch}
                                                    onChange={(e) => {
                                                        setDestinationBranch(e.target.value)
                                                        setRows([createNewRow()])
                                                    }}
                                                    className="w-full h-12 bg-[#1A1A24] border border-purple-500/20 rounded-xl px-4 text-gray-200 focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all"
                                                    required
                                                    disabled={!sourceBranch}
                                                >
                                                    <option value="">Pilih cabang tujuan</option>
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

                                        {/* Dynamic Transfer Queue */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-gray-300 font-medium">Daftar Antrean Transfer</h3>
                                            </div>

                                            {rows.map((row) => (
                                                <div key={row.id} className="relative p-4 bg-white/5 border border-purple-500/20 rounded-xl shadow-sm">
                                                    {rows.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveRow(row.id)}
                                                            className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all cursor-pointer z-10"
                                                            title="Hapus baris ini"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}

                                                    <div className="grid md:grid-cols-[1fr_auto] gap-4 items-start pt-2">
                                                        {/* Product Search */}
                                                        <div className="relative">
                                                            <label className="block text-sm text-gray-400 mb-2">Pilih Produk</label>
                                                            <div className="relative">
                                                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                                                                <input
                                                                    type="text"
                                                                    value={row.searchQuery}
                                                                    onChange={(e) => handleSearchSource(row.id, e.target.value)}
                                                                    onFocus={() => setRows(currentRows => currentRows.map(r => r.id === row.id ? { ...r, showDropdown: true } : r))}
                                                                    className="w-full h-12 bg-[#1A1A24] border border-purple-500/20 rounded-xl pl-12 pr-4 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all"
                                                                    placeholder="Ketik nama atau SKU..."
                                                                    disabled={!sourceBranch || !destinationBranch}
                                                                />
                                                                {row.isCheckingDest && (
                                                                    <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400 animate-spin" />
                                                                )}

                                                                {/* Dropdown Results */}
                                                                {row.showDropdown && row.searchQuery && !row.sourceProduct && (
                                                                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#1A1A24] border border-purple-500/30 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] max-h-60 overflow-y-auto z-20">
                                                                        {row.isSearchingSource ? (
                                                                            <div className="p-4 text-center text-gray-500 text-sm">Mencari...</div>
                                                                        ) : row.searchResults.length > 0 ? (
                                                                            row.searchResults.map((product) => (
                                                                                <div
                                                                                    key={product.id}
                                                                                    className="px-4 py-3 cursor-pointer hover:bg-white/5 border-b border-purple-500/10 last:border-b-0 transition-colors"
                                                                                    onClick={() => handleSelectSourceProduct(row.id, product)}
                                                                                >
                                                                                    <div className="flex items-center justify-between">
                                                                                        <div>
                                                                                            <p className="text-sm text-gray-200">{product.name}</p>
                                                                                            <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                                                                                        </div>
                                                                                        <p className="text-xs text-blue-400">Stok Asal: {product.stock}</p>
                                                                                    </div>
                                                                                </div>
                                                                            ))
                                                                        ) : (
                                                                            <div className="p-4 text-center text-gray-500 text-sm">Tidak ada produk ditemukan di cabang asal.</div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Selected Product Info */}
                                                            {row.sourceProduct && row.destProduct && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: -10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    className="mt-4 p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 flex flex-wrap gap-4 items-center justify-between"
                                                                >
                                                                    <div>
                                                                        <p className="text-gray-200 text-sm font-medium">{row.sourceProduct.name}</p>
                                                                        <p className="text-gray-500 text-xs mt-0.5">SKU: {row.sourceProduct.sku}</p>
                                                                    </div>
                                                                    <div className="flex gap-4 items-center bg-[#0F0F14]/50 p-2 rounded-lg border border-purple-500/10">
                                                                        <div className="text-center px-2">
                                                                            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Stok Asal</p>
                                                                            <p className={`text-sm font-semibold ${row.sourceProduct.stock > 0 ? 'text-blue-400' : 'text-red-400'}`}>{row.sourceProduct.stock}</p>
                                                                        </div>
                                                                        <ArrowRightLeft className="w-4 h-4 text-gray-600" />
                                                                        <div className="text-center px-2">
                                                                            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Stok Tujuan</p>
                                                                            <p className="text-sm font-semibold text-cyan-400">{row.destProduct.stock}</p>
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            )}

                                                            {/* Error Message */}
                                                            {row.errorMessage && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: -10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex gap-3 items-center"
                                                                >
                                                                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                                                                    <p className="text-red-400 text-sm">{row.errorMessage}</p>
                                                                </motion.div>
                                                            )}
                                                        </div>

                                                        {/* Quantity Input */}
                                                        <div>
                                                            <label className="block text-sm text-gray-400 mb-2">Jumlah Transfer</label>
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => updateRow(row.id, { quantity: Math.max(1, row.quantity - 1) })}
                                                                    disabled={!row.sourceProduct}
                                                                    className="w-10 h-10 rounded-xl bg-[#1A1A24] border border-purple-500/20 flex items-center justify-center text-gray-400 hover:text-gray-200 hover:border-blue-500/50 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                    <Minus className="w-4 h-4" />
                                                                </button>
                                                                <input
                                                                    type="number"
                                                                    value={row.quantity}
                                                                    onChange={(e) => updateRow(row.id, { quantity: Math.max(1, Number(e.target.value)) })}
                                                                    className="w-20 h-10 bg-[#1A1A24] border border-purple-500/20 rounded-xl px-2 text-center text-gray-200 focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all"
                                                                    min="1"
                                                                    max={row.sourceProduct?.stock || 1}
                                                                    disabled={!row.sourceProduct}
                                                                    required
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const max = row.sourceProduct?.stock || 0
                                                                        if (row.quantity < max) updateRow(row.id, { quantity: row.quantity + 1 })
                                                                    }}
                                                                    disabled={!row.sourceProduct || row.quantity >= (row.sourceProduct?.stock || 0)}
                                                                    className="w-10 h-10 rounded-xl bg-[#1A1A24] border border-purple-500/20 flex items-center justify-center text-gray-400 hover:text-gray-200 hover:border-blue-500/50 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                    <Plus className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div>
                                            <button
                                                type="button"
                                                onClick={handleAddRow}
                                                disabled={!sourceBranch || !destinationBranch}
                                                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-dashed border-purple-500/40 text-purple-400 hover:bg-purple-500/10 hover:border-purple-500 hover:text-purple-300 transition-all cursor-pointer font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                                            >
                                                <Plus className="w-5 h-5" />
                                                Tambahkan ke Daftar Antrean
                                            </button>
                                        </div>
                                    </div>
                                </form>

                                {/* Footer */}
                                <div className="p-6 border-t border-purple-500/20 flex gap-3 justify-end shrink-0 bg-[#0F0F14]/90">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-6 py-2.5 rounded-xl border border-purple-500/30 text-gray-400 hover:text-gray-200 hover:border-purple-500/50 transition-all cursor-pointer"
                                        disabled={isExecuting}
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        form="transfer-form"
                                        disabled={isExecuting}
                                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all font-medium cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isExecuting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRightLeft className="w-5 h-5" />}
                                        Eksekusi Transfer
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Confirmation Modal Rendered Outside Main Modal Overlay Scope */}
            <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={executeConfirmedTransfer}
                title="Konfirmasi Transfer Stok"
                description={
                    <>
                        Apakah Anda yakin ingin mengeksekusi transfer stok terhadap{' '}
                        <span className="text-cyan-400 font-semibold">{rows.filter(r => r.sourceProduct && r.destProduct && r.quantity > 0).length} produk</span> ini?
                        Stok asal akan langsung dipotong.
                    </>
                }
                confirmText="Ya, Eksekusi"
                cancelText="Batal"
                icon={AlertTriangle}
                theme="info"
                isLoading={isExecuting}
            />
        </>
    )
}
