import { X, Edit, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { ServiceProduct } from '../../services/productService';

interface ServiceDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    service: ServiceProduct;
    onEdit: () => void;
}

export function ServiceDetailModal({
    isOpen,
    onClose,
    service,
    onEdit,
}: ServiceDetailModalProps) {
    if (!isOpen) return null;

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(val);

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
                            <h2 className="text-xl md:text-2xl text-gray-200">{service.name}</h2>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-xs">
                                    {service.categoryName || 'Tidak ada kategori'}
                                </span>
                                <span className={`px-2 py-1 rounded-lg text-xs ${service.is_active !== false ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-500'}`}>
                                    {service.is_active !== false ? 'Aktif' : 'Nonaktif'}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-lg bg-white/5 border border-purple-500/20 flex items-center justify-center text-gray-400 hover:text-gray-200 hover:border-red-500/50 transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                        {/* Detail Service */}
                        <div className="mb-6">
                            <h3 className="text-sm text-gray-400 mb-2">Detail Layanan</h3>
                            <p className="text-sm text-gray-300">
                                {service.detailService || 'Tidak ada deskripsi layanan yang disediakan.'}
                            </p>
                        </div>

                        {/* Price Info */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-white/5 border border-purple-500/20 rounded-xl p-4">
                                <p className="text-xs text-gray-500 mb-1">Harga Modal</p>
                                <p className="text-lg text-gray-300">{formatCurrency(service.capitalPrice)}</p>
                            </div>
                            <div className="bg-white/5 border border-purple-500/20 rounded-xl p-4">
                                <p className="text-xs text-gray-500 mb-1">Harga Jual</p>
                                <p className="text-lg text-cyan-400">{formatCurrency(service.price)}</p>
                            </div>
                            <div className="bg-white/5 border border-purple-500/20 rounded-xl p-4">
                                <p className="text-xs text-gray-500 mb-1">Biaya Overhead</p>
                                <p className="text-lg text-amber-400">{formatCurrency(service.biaya_overhead || 0)}</p>
                            </div>
                        </div>

                        {/* Linked Products */}
                        <div>
                            <h3 className="text-sm text-gray-400 mb-3">Produk Tertaut</h3>
                            {service.linkedProducts && service.linkedProducts.length > 0 ? (
                                <div className="space-y-2">
                                    {service.linkedProducts.map((lp) => (
                                        <div
                                            key={lp.sku || lp.id}
                                            className="flex items-center gap-3 bg-white/5 border border-purple-500/20 rounded-xl p-4"
                                        >
                                            <div className="p-2 bg-cyan-500/10 rounded-lg">
                                                <Package className="w-5 h-5 text-cyan-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-200 font-medium">{lp.name}</p>
                                                <p className="text-xs text-gray-500">SKU: {lp.sku}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 bg-white/5 border border-purple-500/20 rounded-xl p-4">
                                    <div className="p-2 bg-cyan-500/10 rounded-lg">
                                        <Package className="w-5 h-5 text-cyan-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-200 font-medium">
                                            {service.count_product} Produk Fisik
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Barang yang tertaut otomatis saat layanan ini dipilih.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-purple-500/20 flex gap-3 justify-end shrink-0">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl border border-purple-500/30 text-gray-400 hover:text-gray-200 hover:border-purple-500/50 transition-all"
                        >
                            Tutup
                        </button>
                        <button
                            onClick={() => {
                                onClose();
                                onEdit();
                            }}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all"
                        >
                            <Edit className="w-5 h-5" />
                            Edit Layanan
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
