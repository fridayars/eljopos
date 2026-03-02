import { X, Save, Image as ImageIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useState, useEffect } from 'react'
import type { ProductItem } from '../../services/productService'

interface EditProductModalProps {
    isOpen: boolean
    onClose: () => void
    product: ProductItem | null
    onSave: (id: string, product: Partial<ProductItem>) => void
}

export function EditProductModal({ isOpen, onClose, product, onSave }: EditProductModalProps) {
    const [formData, setFormData] = useState<Partial<ProductItem>>({})

    useEffect(() => {
        if (product && isOpen) {
            setFormData({ ...product })
        }
    }, [product, isOpen])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (formData && product) {
            onSave(product.id, formData)
            onClose()
        }
    }

    const handleChange = (field: keyof ProductItem, value: string | number) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    if (!formData) return null

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
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-[#0F0F14]/95 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-[0_0_40px_rgba(139,92,246,0.3)] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                            {/* Header */}
                            <div className="p-6 border-b border-purple-500/20 flex items-center justify-between shrink-0">
                                <div>
                                    <h2 className="text-xl md:text-2xl text-gray-200">
                                        {product ? 'Edit Produk' : 'Tambah Produk'}
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">Perbarui informasi produk ini</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-10 h-10 rounded-lg bg-white/5 border border-purple-500/20 flex items-center justify-center text-gray-400 hover:text-gray-200 hover:border-red-500/50 transition-all cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
                                <div className="space-y-4">
                                    {/* Name */}
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Nama Produk *</label>
                                        <input
                                            type="text"
                                            value={formData.name || ''}
                                            onChange={(e) => handleChange('name', e.target.value)}
                                            className="w-full h-12 bg-white/5 border border-purple-500/20 rounded-xl px-4 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all"
                                            required
                                        />
                                    </div>

                                    {/* SKU and Type */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">SKU / Kode Item *</label>
                                            <input
                                                type="text"
                                                value={formData.sku || ''}
                                                onChange={(e) => handleChange('sku', e.target.value)}
                                                className="w-full h-12 bg-white/5 border border-purple-500/20 rounded-xl px-4 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Tipe Item</label>
                                            <select
                                                value={formData.item_type || 'product'}
                                                onChange={(e) => handleChange('item_type', e.target.value as any)}
                                                className="w-full h-12 bg-white/5 border border-purple-500/20 rounded-xl px-4 text-gray-200 focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all"
                                            >
                                                <option value="product">Produk Barang (Fisik)</option>
                                                <option value="layanan">Layanan / Jasa</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Price and Cost */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Harga Modal (Rp)</label>
                                            <input
                                                type="number"
                                                value={formData.cost_price || 0}
                                                onChange={(e) => handleChange('cost_price', Number(e.target.value))}
                                                className="w-full h-12 bg-white/5 border border-purple-500/20 rounded-xl px-4 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all"
                                                min="0"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Harga Jual (Rp) *</label>
                                            <input
                                                type="number"
                                                value={formData.price || 0}
                                                onChange={(e) => handleChange('price', Number(e.target.value))}
                                                className="w-full h-12 bg-white/5 border border-purple-500/20 rounded-xl px-4 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all"
                                                required
                                                min="0"
                                            />
                                        </div>
                                    </div>

                                    {/* Stock */}
                                    {formData.item_type === 'product' && (
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Stok Saat Ini</label>
                                            <input
                                                type="number"
                                                value={formData.stok || 0}
                                                onChange={(e) => handleChange('stok', Number(e.target.value))}
                                                className="w-full h-12 bg-white/5 border border-purple-500/20 rounded-xl px-4 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all"
                                                required
                                                min="0"
                                            />
                                        </div>
                                    )}

                                    {/* Categories */}
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Nama Kategori</label>
                                        <input
                                            type="text"
                                            value={formData.kategori_name || ''}
                                            onChange={(e) => handleChange('kategori_name', e.target.value)}
                                            className="w-full h-12 bg-white/5 border border-purple-500/20 rounded-xl px-4 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 transition-all"
                                            placeholder="Contoh: Hardware, Minuman"
                                        />
                                    </div>

                                    {/* Image URL */}
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">URL Gambar</label>
                                        <div className="flex gap-2">
                                            <div className="flex-1 relative">
                                                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                                <input
                                                    type="url"
                                                    value={formData.image || ''}
                                                    onChange={(e) => handleChange('image', e.target.value)}
                                                    className="w-full h-12 bg-white/5 border border-purple-500/20 rounded-xl pl-10 pr-4 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 transition-all"
                                                    placeholder="https://example.com/image.jpg"
                                                />
                                            </div>
                                        </div>
                                        {formData.image && (
                                            <div className="mt-3">
                                                <img
                                                    src={formData.image}
                                                    alt="Preview"
                                                    className="w-24 h-24 rounded-lg object-cover border border-purple-500/20"
                                                    onError={(e) => {
                                                        e.currentTarget.src =
                                                            'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=300&fit=crop'
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </form>

                            {/* Footer */}
                            <div className="p-6 border-t border-purple-500/20 flex gap-3 justify-end shrink-0 bg-[#0F0F14]/90">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-6 py-2.5 rounded-xl border border-purple-500/30 text-gray-400 hover:text-gray-200 hover:border-purple-500/50 transition-all cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all cursor-pointer"
                                >
                                    <Save className="w-5 h-5" />
                                    Simpan Perubahan
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
