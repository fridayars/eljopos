import { useState } from 'react';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { ServiceProduct, ServiceCategory, ProductItem } from '../../services/productService';

interface EditServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    service: ServiceProduct;
    categories: ServiceCategory[];
    products: ProductItem[];
    onChange: (service: ServiceProduct) => void;
    onSave: () => void;
}

export function EditServiceModal({
    isOpen,
    onClose,
    service,
    categories,
    products,
    onChange,
    onSave,
}: EditServiceModalProps) {
    const [productSearch, setProductSearch] = useState('');
    const [showProductDropdown, setShowProductDropdown] = useState(false);

    if (!isOpen) return null;

    const handleCategoryChange = (categoryId: string) => {
        const category = categories.find((cat) => cat.id === categoryId);
        onChange({
            ...service,
            categoryId,
            categoryName: category?.name || '',
        });
    };

    const filteredProducts = products.filter((p) => {
        const search = productSearch.toLowerCase();
        const matchesSearch = !search || p.name.toLowerCase().includes(search) || p.sku.toLowerCase().includes(search);
        // Don't show products already linked
        const alreadyLinked = (service.linkedProducts || []).some(lp => lp.sku === p.sku);
        return matchesSearch && !alreadyLinked;
    });

    const handleAddProduct = (product: ProductItem) => {
        const current = service.linkedProducts || [];
        onChange({
            ...service,
            linkedProducts: [...current, { id: product.id, sku: product.sku, name: product.name }],
        });
        setProductSearch('');
        setShowProductDropdown(false);
    };

    const handleRemoveProduct = (sku: string) => {
        const current = service.linkedProducts || [];
        onChange({
            ...service,
            linkedProducts: current.filter(p => p.sku !== sku),
        });
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-[#0F0F14]/95 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-[0_0_40px_rgba(139,92,246,0.3)] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-6 border-b border-purple-500/20 flex items-center justify-between shrink-0">
                        <div>
                            <h2 className="text-xl md:text-2xl text-gray-200">
                                {service.id ? 'Edit Layanan' : 'Tambah Layanan Baru'}
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                {service.id ? 'Perbarui informasi layanan' : 'Buat produk layanan baru'}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-lg bg-white/5 border border-purple-500/20 flex items-center justify-center text-gray-400 hover:text-gray-200 hover:border-red-500/50 transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="space-y-6">
                            {/* Service Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Nama Layanan *</label>
                                    <input
                                        type="text"
                                        value={service.name}
                                        onChange={(e) => onChange({ ...service, name: e.target.value })}
                                        className="w-full h-12 bg-white/5 border border-purple-500/20 rounded-xl px-4 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50"
                                        placeholder="Contoh: Pasang LCD iPhone"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Kategori Layanan</label>
                                    <select
                                        value={service.categoryId}
                                        onChange={(e) => handleCategoryChange(e.target.value)}
                                        className="w-full h-12 bg-white/5 border border-purple-500/20 rounded-xl px-4 text-gray-200 focus:outline-none focus:border-blue-500/50"
                                    >
                                        <option value="">Pilih kategori...</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm text-gray-400 mb-2">Detail/Deskripsi Layanan</label>
                                    <textarea
                                        value={service.detailService}
                                        onChange={(e) => onChange({ ...service, detailService: e.target.value })}
                                        className="w-full h-24 bg-white/5 border border-purple-500/20 rounded-xl px-4 py-3 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 resize-none"
                                        placeholder="Masukkan deskripsi layanan..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Harga Modal (Rp) *</label>
                                    <input
                                        type="number"
                                        value={service.capitalPrice}
                                        onChange={(e) => onChange({ ...service, capitalPrice: Number(e.target.value) })}
                                        className="w-full h-12 bg-white/5 border border-purple-500/20 rounded-xl px-4 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50"
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Harga Jual (Rp) *</label>
                                    <input
                                        type="number"
                                        value={service.price}
                                        onChange={(e) => onChange({ ...service, price: Number(e.target.value) })}
                                        className="w-full h-12 bg-white/5 border border-purple-500/20 rounded-xl px-4 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50"
                                        min="0"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm text-gray-400 mb-2">Biaya Overhead (Rp)</label>
                                    <input
                                        type="number"
                                        value={service.biaya_overhead}
                                        onChange={(e) => onChange({ ...service, biaya_overhead: Number(e.target.value) })}
                                        className="w-full h-12 bg-white/5 border border-purple-500/20 rounded-xl px-4 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50"
                                        min="0"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            {/* Linked Products Section */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-3">Produk Tertaut</label>

                                {/* Linked product list */}
                                {(service.linkedProducts || []).length > 0 && (
                                    <div className="space-y-2 mb-3">
                                        {(service.linkedProducts || []).map((lp) => (
                                            <div
                                                key={lp.sku}
                                                className="flex items-center justify-between bg-white/5 border border-purple-500/20 rounded-xl px-4 py-3"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                                                        <span className="text-cyan-400 text-xs font-bold">P</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-200">{lp.name}</p>
                                                        <p className="text-xs text-gray-500">SKU: {lp.sku}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveProduct(lp.sku)}
                                                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/20 transition-all"
                                                    title="Hapus produk"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Add product dropdown */}
                                <div className="relative">
                                    <div className="flex gap-2">
                                        <div className="flex-1 relative">
                                            <input
                                                type="text"
                                                value={productSearch}
                                                onChange={(e) => {
                                                    setProductSearch(e.target.value);
                                                    setShowProductDropdown(true);
                                                }}
                                                onFocus={() => setShowProductDropdown(true)}
                                                className="w-full h-12 bg-white/5 border border-purple-500/20 rounded-xl pl-4 pr-10 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50"
                                                placeholder="Cari produk untuk ditautkan..."
                                            />
                                            <Plus className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                        </div>
                                    </div>

                                    {/* Dropdown list */}
                                    {showProductDropdown && (
                                        <div className="absolute z-10 w-full mt-2 bg-[#1a1a24] border border-purple-500/30 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                                            {filteredProducts.length > 0 ? (
                                                filteredProducts.slice(0, 10).map((p) => (
                                                    <button
                                                        key={p.id}
                                                        onClick={() => handleAddProduct(p)}
                                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-all text-left"
                                                    >
                                                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                                                            <span className="text-blue-400 text-xs font-bold">P</span>
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm text-gray-200 truncate">{p.name}</p>
                                                            <p className="text-xs text-gray-500">SKU: {p.sku}</p>
                                                        </div>
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="px-4 py-3 text-sm text-gray-500">
                                                    Tidak ada produk ditemukan
                                                </div>
                                            )}
                                            <button
                                                onClick={() => setShowProductDropdown(false)}
                                                className="w-full px-4 py-2 text-xs text-gray-500 hover:text-gray-300 border-t border-purple-500/10"
                                            >
                                                Tutup
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-purple-500/20 flex gap-3 justify-end shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl border border-purple-500/30 text-gray-400 hover:text-gray-200 hover:border-purple-500/50 transition-all"
                        >
                            Batal
                        </button>
                        <button
                            onClick={onSave}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all"
                        >
                            <Save className="w-5 h-5" />
                            {service.id ? 'Simpan Perubahan' : 'Tambah Layanan'}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
