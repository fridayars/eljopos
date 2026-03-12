import { X, Save, Upload, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import type { ProductItem, Category } from '../../services/productService'
import { uploadImage, deleteImage } from '../../services/productService'

function CategorySelect({
    value,
    categories,
    onChange
}: {
    value: string;
    categories: Category[];
    onChange: (val: string) => void;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedCategory = categories.find(c => c.id === value);

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full h-12 bg-white/5 border rounded-xl px-4 text-sm flex items-center justify-between cursor-pointer focus:outline-none transition-all ${isOpen ? 'border-primary shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'border-purple-500/20 hover:border-purple-500/40'
                    }`}
                style={{
                    color: value ? 'var(--foreground)' : 'var(--muted-foreground)',
                    borderColor: isOpen ? 'var(--primary)' : undefined,
                }}
            >
                <span className="text-gray-200">{selectedCategory?.name || 'Pilih Kategori'}</span>
                <span className={`text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                </span>
            </div>

            {isOpen && (
                <div
                    className="absolute left-0 right-0 top-[calc(100%+4px)] py-1 rounded-xl z-[60] overflow-hidden shadow-2xl animate-[fadeIn_0.15s_ease-out]"
                    style={{
                        background: 'var(--card)',
                        border: '1px solid var(--border)',
                    }}
                >
                    <ul className="max-h-60 overflow-y-auto">
                        {categories.map((cat) => (
                            <li
                                key={cat.id}
                                className="px-4 py-3 text-sm cursor-pointer transition-colors"
                                style={{
                                    color: value === cat.id ? 'var(--primary)' : 'var(--foreground)',
                                    background: value === cat.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
                                }}
                                onClick={() => {
                                    onChange(cat.id);
                                    setIsOpen(false);
                                }}
                                onMouseEnter={(e) => {
                                    if (value !== cat.id) e.currentTarget.style.background = 'var(--surface-subtle)';
                                }}
                                onMouseLeave={(e) => {
                                    if (value !== cat.id) e.currentTarget.style.background = 'transparent';
                                }}
                            >
                                {cat.name}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

interface EditProductModalProps {
    isOpen: boolean
    onClose: () => void
    product: ProductItem | null // null = mode tambah
    categories: Category[]
    onSave: (id: string, product: Record<string, any>) => void
}

export function EditProductModal({ isOpen, onClose, product, categories, onSave }: EditProductModalProps) {
    const [formData, setFormData] = useState<Record<string, any>>({})
    const [imageUrl, setImageUrl] = useState<string>('')
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (isOpen) {
            if (product) {
                setFormData({
                    name: product.name || '',
                    sku: product.sku || '',
                    kategori_produk_id: product.kategori_produk_id || '',
                    price: product.price || 0,
                    cost_price: product.cost_price || 0,
                    stock: product.stock || 0,
                    jasa_pasang: product.jasa_pasang || 0,
                    ongkir_asuransi: product.ongkir_asuransi || 0,
                    biaya_overhead: product.biaya_overhead || 0,
                    image_url: product.image_url || product.image || '',
                })
                setImageUrl(product.image_url || product.image || '')
            } else {
                setFormData({
                    name: '',
                    sku: '',
                    kategori_produk_id: categories[0]?.id || '',
                    price: 0,
                    cost_price: 0,
                    stock: 0,
                    jasa_pasang: 0,
                    ongkir_asuransi: 0,
                    biaya_overhead: 0,
                    image_url: '',
                })
                setImageUrl('')
            }
        }
    }, [product, isOpen, categories])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const payload = {
            ...formData,
            image_url: imageUrl,
        }
        onSave(product?.id || '', payload)
    }

    const handleChange = (field: string, value: string | number) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleSelectImage = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Ukuran gambar maksimal 5MB')
            return
        }

        setIsUploading(true)
        const res = await uploadImage(file, 'products')
        setIsUploading(false)

        if (res.success && res.data) {
            setImageUrl(res.data.url)
            toast.success('Gambar berhasil diupload')
        } else {
            toast.error(res.message || 'Gagal mengupload gambar')
        }

        e.target.value = ''
    }

    const handleRemoveImage = async () => {
        if (!imageUrl) return

        const res = await deleteImage(imageUrl)
        if (res.success) {
            setImageUrl('')
            toast.success('Gambar berhasil dihapus')
        } else {
            toast.error(res.message || 'Gagal menghapus gambar')
        }
    }

    const inputClass = "w-full h-12 bg-white/5 border border-purple-500/20 rounded-xl px-4 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all"

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
                        <div className="backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-[0_0_40px_rgba(139,92,246,0.3)] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" style={{ background: 'var(--surface-modal)' }}>
                            {/* Header */}
                            <div className="p-6 border-b border-purple-500/20 flex items-center justify-between shrink-0">
                                <div>
                                    <h2 className="text-xl md:text-2xl text-gray-200">
                                        {product ? 'Edit Produk' : 'Tambah Produk'}
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {product ? 'Perbarui informasi produk ini' : 'Tambahkan produk baru ke inventaris'}
                                    </p>
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
                                            className={inputClass}
                                            placeholder="Contoh: Lampu LED 10W"
                                            required
                                        />
                                    </div>

                                    {/* SKU and Category */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">SKU / Kode Item *</label>
                                            <input
                                                type="text"
                                                value={formData.sku || ''}
                                                onChange={(e) => handleChange('sku', e.target.value)}
                                                className={inputClass}
                                                placeholder="Contoh: LED-10W-001"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Kategori *</label>
                                            <CategorySelect
                                                value={formData.kategori_produk_id || ''}
                                                categories={categories}
                                                onChange={(val) => handleChange('kategori_produk_id', val)}
                                            />
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
                                                className={inputClass}
                                                min="0"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Harga Jual (Rp) *</label>
                                            <input
                                                type="number"
                                                value={formData.price || 0}
                                                onChange={(e) => handleChange('price', Number(e.target.value))}
                                                className={inputClass}
                                                required
                                                min="0"
                                            />
                                        </div>
                                    </div>

                                    {/* Stock Display */}
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Stok Saat Ini</label>
                                        <input
                                            type="number"
                                            value={formData.stock || 0}
                                            className={inputClass}
                                            min="0"
                                            disabled
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Stok dapat diubah melalui fitur penyesuaian stok di halaman inventaris</p>
                                    </div>

                                    {/* Jasa Pasang, Ongkir, Overhead */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Jasa Pasang (Rp)</label>
                                            <input
                                                type="number"
                                                value={formData.jasa_pasang || 0}
                                                onChange={(e) => handleChange('jasa_pasang', Number(e.target.value))}
                                                className={inputClass}
                                                min="0"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Ongkir & Asuransi (Rp)</label>
                                            <input
                                                type="number"
                                                value={formData.ongkir_asuransi || 0}
                                                onChange={(e) => handleChange('ongkir_asuransi', Number(e.target.value))}
                                                className={inputClass}
                                                min="0"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Biaya Overhead (Rp)</label>
                                            <input
                                                type="number"
                                                value={formData.biaya_overhead || 0}
                                                onChange={(e) => handleChange('biaya_overhead', Number(e.target.value))}
                                                className={inputClass}
                                                min="0"
                                            />
                                        </div>
                                    </div>

                                    {/* Image Upload */}
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Gambar Produk</label>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />

                                        {!imageUrl ? (
                                            <button
                                                type="button"
                                                onClick={handleSelectImage}
                                                disabled={isUploading}
                                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-purple-500/20 text-gray-400 hover:text-gray-200 hover:border-blue-500/50 transition-all cursor-pointer disabled:opacity-50"
                                            >
                                                {isUploading ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        Mengupload...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload className="w-4 h-4" />
                                                        Pilih Gambar
                                                    </>
                                                )}
                                            </button>
                                        ) : (
                                            <div className="relative inline-block">
                                                <div className="w-28 h-28 rounded-xl overflow-hidden border border-purple-500/20 bg-white/5">
                                                    <img
                                                        src={imageUrl}
                                                        alt="Preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveImage}
                                                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all cursor-pointer shadow-lg"
                                                    title="Hapus gambar"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        )}
                                        <p className="text-xs text-gray-600 mt-2">Format: JPG, PNG, WebP. Maks 5MB</p>
                                    </div>
                                </div>
                            </form>

                            {/* Footer */}
                            <div className="p-6 border-t border-purple-500/20 flex gap-3 justify-end shrink-0" style={{ background: 'var(--surface-overlay)' }}>
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
                                    {product ? 'Simpan Perubahan' : 'Tambah Produk'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
