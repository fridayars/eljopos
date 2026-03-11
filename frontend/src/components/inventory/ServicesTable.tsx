import { Search, Plus, Edit, Trash2, Download, Upload } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import type { ServiceProduct, ServiceCategory } from '../../services/productService';

function CategoryFilterSelect({
    value,
    categories,
    onChange
}: {
    value: string;
    categories: ServiceCategory[];
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

    const selectedCategory = value === 'all' 
        ? { id: 'all', name: 'Semua Kategori' }
        : categories.find(c => c.id === value);

    const allOptions = [
        { id: 'all', name: 'Semua Kategori' },
        ...categories
    ];

    return (
        <div className="relative w-full md:w-64" ref={dropdownRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full h-[44px] bg-white/5 border rounded-xl px-4 text-sm flex items-center justify-between cursor-pointer focus:outline-none transition-all ${
                    isOpen ? 'border-primary shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'border-purple-500/20 hover:border-purple-500/40'
                }`}
                style={{
                    color: value ? 'var(--foreground)' : 'var(--muted-foreground)',
                    borderColor: isOpen ? 'var(--primary)' : undefined,
                }}
            >
                <span className="text-gray-200">{selectedCategory?.name || 'Semua Kategori'}</span>
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
                        {allOptions.map((cat) => (
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
    onToggleStatus: (id: string, newStatus: boolean) => void;
    onExport: () => void;
    onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    userPermissions: string[];
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
    onToggleStatus,
    onExport,
    onImport,
    currentPage,
    totalPages,
    onPageChange,
    userPermissions,
}: ServicesTableProps) {
    const displayServices = services;

    return (
        <div className="absolute inset-0 flex flex-col overflow-hidden h-full">
            <div className="flex-1 overflow-y-auto pb-32 md:pb-6">
                <div className="p-4 md:p-6 space-y-6">
                    {/* Category Filter, Search and Toolbar */}
                    <div className="flex flex-col gap-4 border-b border-purple-500/10 pb-6">
                        {/* Category Filter */}
                        <div>
                            <label className="text-sm text-gray-400 mb-2 block">
                                Filter berdasarkan Kategori
                            </label>
                            <CategoryFilterSelect
                                value={selectedCategoryId}
                                categories={categories}
                                onChange={onCategoryChange}
                            />
                        </div>

                        {/* Search and Buttons */}
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Cari layanan berdasarkan nama dan deskripsi"
                                    value={searchQuery}
                                    onChange={(e) => onSearchChange(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-purple-500/20 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
                                />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {userPermissions.includes('service.import') && (
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
                                )}

                                {userPermissions.includes('service.export') && (
                                    <button
                                        onClick={onExport}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-purple-500/20 text-gray-400 hover:text-gray-200 hover:border-blue-500/50 transition-all"
                                    >
                                        <Download className="w-5 h-5" />
                                        <span className="text-sm">Export</span>
                                    </button>
                                )}

                                {userPermissions.includes('service.create') && (
                                    <button
                                        onClick={onAdd}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all"
                                    >
                                        <Plus className="w-5 h-5" />
                                        <span className="text-sm">Tambah Layanan</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Service List / Table */}
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
                                                    {service.categoryName || 'Tidak ada kategori'}
                                                </span>
                                                <span className={`px-2 py-1 rounded-lg text-xs ${service.is_active !== false ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-500'}`}>
                                                    {service.is_active !== false ? 'Aktif' : 'Nonaktif'}
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
                                        {/* Status Toggle Switch */}
                                        {userPermissions.includes('service.edit') && (
                                            <button
                                                onClick={() => onToggleStatus(service.id, !service.is_active)}
                                                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none"
                                                style={{
                                                    backgroundColor: service.is_active !== false ? 'rgba(16, 185, 129, 0.6)' : 'rgba(107, 114, 128, 0.4)',
                                                }}
                                                title={service.is_active !== false ? 'Nonaktifkan' : 'Aktifkan'}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${service.is_active !== false ? 'translate-x-6' : 'translate-x-1'}`}
                                                />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => onDetail(service)}
                                            className="px-3 py-2 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 hover:bg-cyan-500/30 transition-all text-sm"
                                        >
                                            Detail
                                        </button>
                                        {userPermissions.includes('service.edit') && (
                                            <button
                                                onClick={() => onEdit(service)}
                                                className="p-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-all"
                                                title="Edit Layanan"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                        )}
                                        {userPermissions.includes('service.delete') && (
                                            <button
                                                onClick={() => onDelete(service.id)}
                                                className="p-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-all"
                                                title="Hapus Layanan"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
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
