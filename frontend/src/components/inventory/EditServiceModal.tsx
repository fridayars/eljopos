import { X, Save, Search, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { ServiceProduct, ServiceCategory, ProductItem } from '../../services/productService';
import { toast } from 'sonner';

interface EditServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    service: ServiceProduct;
    categories: ServiceCategory[];
    products: ProductItem[]; // for linked items
    onChange: (service: ServiceProduct) => void;
    onSave: () => void;
    productSearchQuery: string;
    onProductSearchChange: (query: string) => void;
}

export function EditServiceModal({
    isOpen,
    onClose,
    service,
    categories,
    products,
    onChange,
    onSave,
    productSearchQuery,
    onProductSearchChange,
}: EditServiceModalProps) {
    if (!isOpen) return null;

    const handleCategoryChange = (categoryId: string) => {
        const category = categories.find((cat) => cat.id === categoryId);
        onChange({
            ...service,
            categoryId,
            categoryName: category?.name || '',
        });
    };

    const handleAddProductToService = (product: ProductItem) => {
        const existingItem = service.linkedItems.find((item) => item.productId === product.id);
        if (existingItem) {
            toast.info('Produk sudah ditautkan ke layanan ini');
            return;
        }

        onChange({
            ...service,
            linkedItems: [
                ...service.linkedItems,
                { productId: product.id, productName: product.name, quantity: 1 },
            ],
        });
        onProductSearchChange(''); // Reset search after adding
        toast.success(`${product.name} ditautkan`);
    };

    const handleUpdateItemQuantity = (productId: string, quantity: number) => {
        onChange({
            ...service,
            linkedItems: service.linkedItems.map((item) =>
                item.productId === productId ? { ...item, quantity: Math.max(1, quantity) } : item
            ),
        });
    };

    const handleRemoveProductFromService = (productId: string) => {
        onChange({
            ...service,
            linkedItems: service.linkedItems.filter((item) => item.productId !== productId),
        });
    };

    // Filter products for linking
    const filteredProducts = products.filter(
        (product) =>
            product.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
            product.sku.toLowerCase().includes(productSearchQuery.toLowerCase())
    );

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
                    className="bg-[#0F0F14]/95 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-[0_0_40px_rgba(139,92,246,0.3)] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-6 border-b border-purple-500/20 flex items-center justify-between shrink-0">
                        <div>
                            <h2 className="text-xl md:text-2xl text-gray-200">
                                {service.id ? 'Edit Layanan' : 'Tambah Layanan Baru'}
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                {service.id ? 'Perbarui informasi layanan' : 'Buat produk layanan baru beserta barang tautannya'}
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
                                    <label className="block text-sm text-gray-400 mb-2">SKU / Kode *</label>
                                    <input
                                        type="text"
                                        value={service.sku}
                                        onChange={(e) => onChange({ ...service, sku: e.target.value })}
                                        className="w-full h-12 bg-white/5 border border-purple-500/20 rounded-xl px-4 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50"
                                        placeholder="SVC-001"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm text-gray-400 mb-2">Kategori Layanan *</label>
                                    <select
                                        value={service.categoryId}
                                        onChange={(e) => handleCategoryChange(e.target.value)}
                                        className="w-full h-12 bg-white/5 border border-purple-500/20 rounded-xl px-4 text-gray-200 focus:outline-none focus:border-blue-500/50"
                                    >
                                        <option value="" disabled>Pilih kategori...</option>
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
                                    <label className="block text-sm text-gray-400 mb-2">Harga Modal / Biaya Dasar (Rp) *</label>
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
                            </div>

                            <hr className="border-purple-500/20" />

                            {/* Linked Items */}
                            <div>
                                <label className="block text-sm text-gray-200 mb-1">Tautkan Produk Barang Fisik (Opsional)</label>
                                <p className="text-sm text-gray-500 mb-4">Tambahkan barang bawaan yang terpakai jika layanan ini dieksekusi.</p>

                                {/* Selected Items */}
                                {service.linkedItems.length > 0 && (
                                    <div className="mb-4 space-y-2">
                                        {service.linkedItems.map((item) => (
                                            <div
                                                key={item.productId}
                                                className="flex items-center gap-3 bg-white/5 border border-cyan-500/30 rounded-lg p-3"
                                            >
                                                <div className="flex-1">
                                                    <p className="text-sm text-gray-200">{item.productName}</p>
                                                </div>
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => handleUpdateItemQuantity(item.productId, Number(e.target.value))}
                                                    className="w-20 h-8 bg-[#0F0F14] border border-cyan-500/30 rounded-lg px-2 text-gray-200 text-center focus:outline-none focus:border-cyan-500/70"
                                                    min="1"
                                                />
                                                <button
                                                    onClick={() => handleRemoveProductFromService(item.productId)}
                                                    className="p-1.5 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-all"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Product Search */}
                                <div className="relative mb-3">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input
                                        type="text"
                                        placeholder="Cari produk fisik untuk ditautkan..."
                                        value={productSearchQuery}
                                        onChange={(e) => onProductSearchChange(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-purple-500/20 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
                                    />
                                </div>

                                {/* Product List */}
                                {productSearchQuery && (
                                    <div className="max-h-64 overflow-y-auto bg-white/5 border border-purple-500/20 rounded-xl">
                                        {filteredProducts.length > 0 ? (
                                            filteredProducts.map((product) => (
                                                <button
                                                    key={product.id}
                                                    onClick={() => handleAddProductToService(product)}
                                                    className="w-full flex items-center justify-between p-3 hover:bg-white/10 transition-all border-b border-purple-500/10 last:border-0 text-left"
                                                >
                                                    <div>
                                                        <p className="text-sm text-gray-200">{product.name}</p>
                                                        <p className="text-xs text-gray-500">{product.sku}</p>
                                                    </div>
                                                    <Plus className="w-4 h-4 text-cyan-400" />
                                                </button>
                                            ))
                                        ) : (
                                            <div className="p-4 text-center text-sm text-gray-500">
                                                Tidak ada produk fisik ditemukan
                                            </div>
                                        )}
                                    </div>
                                )}
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
