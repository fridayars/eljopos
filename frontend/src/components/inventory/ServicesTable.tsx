import { Search, Plus, Edit, Trash2, Download, Upload } from 'lucide-react';
import type { ServiceProduct, ServiceCategory } from '../../services/productService';

interface ServicesTableProps {
    services: ServiceProduct[];
    categories: ServiceCategory[];
    searchQuery: string;
    onSearchChange: (query: string) => void;
    selectedCategoryId: string;
    onCategoryChange: (id: string) => void;
    onAdd: () => void;
    onEdit: (service: ServiceProduct) => void;
    onDelete: (id: string) => void;
    onDetail: (service: ServiceProduct) => void;
    onExport: () => void;
    onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function ServicesTable({
    services,
    categories,
    searchQuery,
    onSearchChange,
    selectedCategoryId,
    onCategoryChange,
    onAdd,
    onEdit,
    onDelete,
    onDetail,
    onExport,
    onImport,
    currentPage,
    totalPages,
    onPageChange,
}: ServicesTableProps) {
    // Backend handles filtering, so we use services directly
    const displayServices = services;

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Category Filter, Search and Toolbar */}
            <div className="p-4 md:p-6 border-b border-purple-500/10 shrink-0">
                <div className="flex flex-col gap-4">
                    {/* Category Filter */}
                    <div>
                        <label className="text-sm text-gray-400 mb-2 block">
                            Filter berdasarkan Kategori
                        </label>
                        <select
                            value={selectedCategoryId}
                            onChange={(e) => onCategoryChange(e.target.value)}
                            className="w-full md:w-64 px-4 py-2.5 bg-white/5 border border-purple-500/20 rounded-xl text-gray-200 focus:outline-none focus:border-blue-500/50"
                        >
                            <option value="all">Semua Kategori</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Search and Buttons */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Cari layanan berdasarkan nama atau SKU..."
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-purple-500/20 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-purple-500/20 text-gray-400 hover:text-gray-200 hover:border-blue-500/50 transition-all cursor-pointer">
                                <Upload className="w-5 h-5" />
                                <span className="text-sm">Import</span>
                                <input
                                    type="file"
                                    accept=".xlsx,.xls"
                                    onChange={onImport}
                                    className="hidden"
                                />
                            </label>

                            <button
                                onClick={onExport}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-purple-500/20 text-gray-400 hover:text-gray-200 hover:border-blue-500/50 transition-all"
                            >
                                <Download className="w-5 h-5" />
                                <span className="text-sm">Export</span>
                            </button>

                            <button
                                onClick={onAdd}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all"
                            >
                                <Plus className="w-5 h-5" />
                                <span className="text-sm">Tambah Layanan</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Service List / Table */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="grid gap-4">
                    {displayServices.length > 0 ? (
                        displayServices.map((service) => (
                            <div
                                key={service.id}
                                className="bg-white/5 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-4 hover:border-purple-500/40 transition-all"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-2">
                                            <h3 className="text-lg text-gray-200">{service.name}</h3>
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-xs">
                                                    {service.categoryName}
                                                </span>
                                                <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded-lg text-xs">
                                                    {service.sku}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-3 truncate max-w-lg">
                                            {service.detailService || 'Tidak ada spesifikasi layanan.'}
                                        </p>
                                        <div className="flex items-center gap-4 flex-wrap">
                                            <div>
                                                <p className="text-xs text-gray-500">Harga Modal</p>
                                                <p className="text-sm text-gray-400">
                                                    {new Intl.NumberFormat('id-ID', {
                                                        style: 'currency',
                                                        currency: 'IDR',
                                                        minimumFractionDigits: 0,
                                                    }).format(service.capitalPrice)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Harga Jual</p>
                                                <p className="text-lg text-cyan-400">
                                                    {new Intl.NumberFormat('id-ID', {
                                                        style: 'currency',
                                                        currency: 'IDR',
                                                        minimumFractionDigits: 0,
                                                    }).format(service.price)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Produk Tertaut</p>
                                                <p className="text-sm text-gray-300">
                                                    {service.count_product} item
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                        <button
                                            onClick={() => onDetail(service)}
                                            className="px-3 py-2 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 hover:bg-cyan-500/30 transition-all text-sm"
                                        >
                                            Detail
                                        </button>
                                        <button
                                            onClick={() => onEdit(service)}
                                            className="p-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-all"
                                            title="Edit Layanan"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(service.id)}
                                            className="p-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-all"
                                            title="Hapus Layanan"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-gray-500" />
                            </div>
                            <p className="text-gray-400">Tidak ada produk layanan ditemukan</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="px-4 md:px-6 py-4 border-t border-purple-500/10 flex items-center justify-between bg-black/20 shrink-0">
                    <p className="text-sm text-gray-500">
                        Halaman <span className="text-gray-300 font-medium">{currentPage}</span> dari <span className="text-gray-300 font-medium">{totalPages}</span>
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`px-3 py-1.5 rounded-lg border text-sm transition-all ${currentPage === 1
                                ? 'border-purple-500/10 text-gray-600 cursor-not-allowed'
                                : 'border-purple-500/20 text-gray-400 hover:text-white hover:border-blue-500/50'
                                }`}
                        >
                            Sebelumnya
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => onPageChange(i + 1)}
                                className={`w-9 h-9 rounded-lg border text-sm transition-all flex items-center justify-center ${currentPage === i + 1
                                    ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                                    : 'border-purple-500/20 text-gray-400 hover:text-white hover:border-blue-500/50'
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`px-3 py-1.5 rounded-lg border text-sm transition-all ${currentPage === totalPages
                                ? 'border-purple-500/10 text-gray-600 cursor-not-allowed'
                                : 'border-purple-500/20 text-gray-400 hover:text-white hover:border-blue-500/50'
                                }`}
                        >
                            Berikutnya
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
