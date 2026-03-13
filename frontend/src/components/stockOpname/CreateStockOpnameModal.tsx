import { useState, useEffect, useCallback } from 'react'
import { X, Search, Plus, Trash2, CheckCircle2, Save, Loader2 } from 'lucide-react'
import { getProducts } from '../../services/productService'
import type { ProductItem } from '../../services/productService'
import { stockOpnameService } from '../../services/stockOpnameService'
import { toast } from 'sonner'

interface CreateStockOpnameModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    editOpnameId?: string | null
}

export function CreateStockOpnameModal({ isOpen, onClose, onSuccess, editOpnameId }: CreateStockOpnameModalProps) {
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    
    // Form states
    const [opnameNumber, setOpnameNumber] = useState('')
    const [keterangan, setKeterangan] = useState('')
    const [selectedItems, setSelectedItems] = useState<{
        product_id: string;
        name: string;
        sku: string;
        stok_sistem: number;
        stok_fisik: number;
        keterangan: string;
    }[]>([])

    // Product search states
    const [productSearch, setProductSearch] = useState('')
    const [searchResults, setSearchResults] = useState<ProductItem[]>([])
    const [searchLoading, setSearchLoading] = useState(false)

    // Auto-generate opname number on open
    useEffect(() => {
        if (isOpen) {
            if (editOpnameId) {
                fetchEditData()
            } else {
                const date = new Date()
                const year = date.getFullYear()
                const month = String(date.getMonth() + 1).padStart(2, '0')
                const day = String(date.getDate()).padStart(2, '0')
                const hours = String(date.getHours()).padStart(2, '0')
                const minutes = String(date.getMinutes()).padStart(2, '0')
                const seconds = String(date.getSeconds()).padStart(2, '0')
                setOpnameNumber(`SO/${year}${month}${day}/${hours}${minutes}${seconds}`)
                
                // Reset form
                setKeterangan('')
                setSelectedItems([])
                setProductSearch('')
                setSearchResults([])
            }
        }
    }, [isOpen, editOpnameId])

    const fetchEditData = async () => {
        if (!editOpnameId) return
        setLoading(true)
        try {
            const res = await stockOpnameService.getById(editOpnameId)
            if (res.success) {
                const data = res.data
                setOpnameNumber(data.opname_number)
                setKeterangan(data.keterangan || '')
                setSelectedItems(data.details.map((d: any) => ({
                    product_id: d.product_id,
                    name: d.product?.name || 'Produk Terhapus',
                    sku: d.product?.sku || '-',
                    stok_sistem: d.stok_sistem,
                    stok_fisik: d.stok_fisik,
                    keterangan: d.keterangan || ''
                })))
            } else {
                toast.error('Gagal memuat data opname')
                onClose()
            }
        } catch (error) {
            console.error('Fetch edit error:', error)
            toast.error('Terjadi kesalahan saat memuat data')
            onClose()
        } finally {
            setLoading(false)
        }
    }

    const searchProducts = useCallback(async (query: string) => {
        if (!query || query.length < 2) {
            setSearchResults([])
            return
        }
        
        setSearchLoading(true)
        try {
            const res = await getProducts({ search: query, limit: 5 })
            if (res.success) {
                setSearchResults(res.data.items)
            }
        } catch (error) {
            console.error('Search error:', error)
        } finally {
            setSearchLoading(false)
        }
    }, [])

    useEffect(() => {
        const timer = setTimeout(() => {
            searchProducts(productSearch)
        }, 500)
        return () => clearTimeout(timer)
    }, [productSearch, searchProducts])

    const addItem = (product: ProductItem) => {
        if (selectedItems.some(item => item.product_id === product.id)) {
            toast.error('Produk sudah ada di daftar')
            return
        }

        setSelectedItems(prev => [...prev, {
            product_id: product.id,
            name: product.name,
            sku: product.sku || '-',
            stok_sistem: product.stock,
            stok_fisik: product.stock, // Default to system stock
            keterangan: ''
        }])
        setProductSearch('')
        setSearchResults([])
    }

    const removeItem = (productId: string) => {
        setSelectedItems(prev => prev.filter(item => item.product_id !== productId))
    }

    const updateItemStokFisik = (productId: string, val: string) => {
        const num = parseInt(val) || 0
        setSelectedItems(prev => prev.map(item => 
            item.product_id === productId ? { ...item, stok_fisik: num } : item
        ))
    }

    const updateItemKeterangan = (productId: string, val: string) => {
        setSelectedItems(prev => prev.map(item => 
            item.product_id === productId ? { ...item, keterangan: val } : item
        ))
    }

    const handleSubmit = async (status: 'DRAFT' | 'COMPLETED') => {
        if (!opnameNumber) {
            toast.error('Nomor opname harus diisi')
            return
        }
        if (selectedItems.length === 0) {
            toast.error('Pilih minimal satu produk')
            return
        }

        setSubmitting(true)
        try {
            const payload = {
                opname_number: opnameNumber,
                keterangan,
                status,
                items: selectedItems.map(item => ({
                    product_id: item.product_id,
                    stok_fisik: item.stok_fisik,
                    keterangan: item.keterangan
                }))
            }

            const res = editOpnameId 
                ? await stockOpnameService.update(editOpnameId, payload)
                : await stockOpnameService.create(payload)

            if (res.success) {
                toast.success(`Stok Opname berhasil ${editOpnameId ? 'diperbarui' : 'disimpan'} sebagai ${status === 'COMPLETED' ? 'Selesai' : 'Draft'}`)
                onSuccess()
                onClose()
            } else {
                toast.error(res.message || 'Gagal menyimpan stok opname')
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Terjadi kesalahan sistem')
        } finally {
            setSubmitting(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />
            
            {/* Modal Content */}
            <div 
                className="relative w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden rounded-3xl shadow-2xl animate-in fade-in zoom-in duration-200"
                style={{ 
                    background: 'var(--surface-overlay)',
                    border: '1px solid var(--border-subtle)',
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[var(--border-subtle)]">
                    <div>
                        <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>{editOpnameId ? 'Edit Stok Opname' : 'Buat Stok Opname Baru'}</h2>
                        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{editOpnameId ? 'Perbarui data penyesuaian stok' : 'Sesuaikan stok fisik produk Anda'}</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-[rgba(255,255,255,0.05)] transition-colors cursor-pointer"
                    >
                        <X className="w-6 h-6" style={{ color: 'var(--muted-foreground)' }} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="w-10 h-10 animate-spin text-[#3B82F6]" />
                            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Memuat data...</p>
                        </div>
                    ) : (
                        <>
                            {/* Basic Info */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Nomor Opname</label>
                            <input
                                type="text"
                                value={opnameNumber}
                                onChange={(e) => setOpnameNumber(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border transition-all focus:border-[#3B82F6] outline-none"
                                style={{ background: 'var(--surface-subtle)', border: '1px solid var(--border-subtle)', color: 'var(--foreground)' }}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Keterangan Umum</label>
                            <input
                                type="text"
                                value={keterangan}
                                onChange={(e) => setKeterangan(e.target.value)}
                                placeholder="Misal: Opname Rutin Bulanan"
                                className="w-full px-4 py-2.5 rounded-xl border transition-all focus:border-[#3B82F6] outline-none"
                                style={{ background: 'var(--surface-subtle)', border: '1px solid var(--border-subtle)', color: 'var(--foreground)' }}
                            />
                        </div>
                    </div>

                    {/* Product Selection */}
                    <div className="space-y-4">
                        <div className="relative">
                            <label className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: 'var(--muted-foreground)' }}>Cari & Tambah Produk</label>
                            <div className="relative group">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                                <input
                                    type="text"
                                    placeholder="Ketik nama produk atau SKU..."
                                    value={productSearch}
                                    onChange={(e) => setProductSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border transition-all focus:border-[#3B82F6] outline-none"
                                    style={{ background: 'var(--surface-subtle)', border: '1px solid var(--border-subtle)', color: 'var(--foreground)' }}
                                />
                                {searchLoading && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <Loader2 className="w-4 h-4 animate-spin text-[#3B82F6]" />
                                    </div>
                                )}
                            </div>

                            {/* Dropdown Results */}
                            {searchResults.length > 0 && (
                                <div 
                                    className="absolute z-10 w-full mt-2 rounded-2xl shadow-xl overflow-hidden border border-[var(--border-subtle)]"
                                    style={{ background: 'var(--surface-overlay)' }}
                                >
                                    {searchResults.map(product => (
                                        <button
                                            key={product.id}
                                            onClick={() => addItem(product)}
                                            className="w-full flex items-center justify-between p-4 hover:bg-[rgba(59,130,246,0.1)] transition-colors cursor-pointer border-b last:border-0 border-[var(--border-subtle)]"
                                        >
                                            <div className="flex flex-col items-start gap-1">
                                                <span className="font-medium" style={{ color: 'var(--foreground)' }}>{product.name}</span>
                                                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>SKU: {product.sku || '-'} • Stok: {product.stock}</span>
                                            </div>
                                            <Plus className="w-5 h-5 text-[#3B82F6]" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Selected Items Table */}
                        <div 
                            className="rounded-2xl border overflow-x-auto"
                            style={{ border: '1px solid var(--border-subtle)' }}
                        >
                            <table className="w-full text-left min-w-[700px]">
                                <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-subtle)' }}>
                                    <tr>
                                        <th className="px-4 py-3 text-xs font-semibold uppercase" style={{ color: 'var(--muted-foreground)' }}>Produk</th>
                                        <th className="px-4 py-3 text-xs font-semibold uppercase text-center" style={{ color: 'var(--muted-foreground)' }}>Stok Sistem</th>
                                        <th className="px-4 py-3 text-xs font-semibold uppercase text-center" style={{ color: 'var(--muted-foreground)' }}>Stok Fisik</th>
                                        <th className="px-4 py-3 text-xs font-semibold uppercase text-center" style={{ color: 'var(--muted-foreground)' }}>Selisih</th>
                                        <th className="px-4 py-3 text-xs font-semibold uppercase" style={{ color: 'var(--muted-foreground)' }}>Ket. Item</th>
                                        <th className="px-4 py-3 text-xs font-semibold uppercase text-right" style={{ color: 'var(--muted-foreground)' }}>Hapus</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border-subtle)]">
                                    {selectedItems.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-10 text-center text-sm italic" style={{ color: 'var(--muted-foreground)' }}>Belum ada produk yang dipilih</td>
                                        </tr>
                                    ) : (
                                        selectedItems.map(item => {
                                            const selisih = item.stok_fisik - item.stok_sistem
                                            const selisihColor = selisih === 0 ? 'var(--muted-foreground)' : selisih > 0 ? '#22C55E' : '#EF4444'
                                            
                                            return (
                                                <tr key={item.product_id} className="hover:bg-[rgba(255,255,255,0.01)] transition-colors">
                                                    <td className="px-4 py-3">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{item.name}</span>
                                                            <span className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>SKU: {item.sku}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-center text-sm" style={{ color: 'var(--foreground)' }}>{item.stok_sistem}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        <input
                                                            type="number"
                                                            value={item.stok_fisik}
                                                            onChange={(e) => updateItemStokFisik(item.product_id, e.target.value)}
                                                            className="w-20 px-2 py-1 rounded-lg border text-center text-sm outline-none focus:border-[#3B82F6]"
                                                            style={{ background: 'var(--surface-subtle)', border: '1px solid var(--border-subtle)', color: 'var(--foreground)' }}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 text-center text-sm font-bold" style={{ color: selisihColor }}>
                                                        {selisih > 0 ? `+${selisih}` : selisih}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="text"
                                                            value={item.keterangan}
                                                            onChange={(e) => updateItemKeterangan(item.product_id, e.target.value)}
                                                            placeholder="Opsional"
                                                            className="w-full min-w-[100px] px-2 py-1 rounded-lg border text-sm outline-none focus:border-[#3B82F6]"
                                                            style={{ background: 'var(--surface-subtle)', border: '1px solid var(--border-subtle)', color: 'var(--foreground)' }}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <button 
                                                            onClick={() => removeItem(item.product_id)}
                                                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-[var(--border-subtle)] flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        <span className="font-bold text-[#3B82F6]">{selectedItems.length}</span> Produk Terpilih
                    </p>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                            disabled={submitting || selectedItems.length === 0}
                            onClick={() => handleSubmit('DRAFT')}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-medium border border-[#3B82F6] text-[#3B82F6] hover:bg-[#3B82F6]/5 disabled:opacity-50 transition-all"
                        >
                            <Save className="w-4 h-4" />
                            Simpan Draft
                        </button>
                        <button
                            disabled={submitting || selectedItems.length === 0}
                            onClick={() => handleSubmit('COMPLETED')}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl font-medium text-white shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all disabled:scale-100"
                            style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            Selesaikan Sekarang
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
