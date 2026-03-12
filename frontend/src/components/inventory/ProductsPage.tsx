import { useState, useRef, useEffect } from 'react'
import { Edit, Download, Upload, ArrowRightLeft, Search, Plus, Trash2, ChevronLeft, ChevronRight, FileX, Wrench, MoreVertical, History, Settings2 } from 'lucide-react'
import { motion } from 'motion/react'
import type { ProductItem, Category } from '../../services/productService'
import { EditStockModal } from './EditStockModal'
import { toast } from 'sonner'

function CategoryFilterSelect({
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

    const selectedCategory = value === 'all'
        ? { id: 'all', name: 'Semua Kategori' }
        : categories.find(c => c.id === value);

    const allOptions = [
        { id: 'all', name: 'Semua Kategori' },
        ...categories
    ];

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

function ProductActionDropdown({
    product,
    userPermissions,
    onEdit,
    onDelete,
    onEditStock,
    onViewStockHistory
}: {
    product: ProductItem;
    userPermissions: string[];
    onEdit: (product: ProductItem) => void;
    onDelete: (product: ProductItem) => void;
    onEditStock: (product: ProductItem) => void;
    onViewStockHistory: (product: ProductItem) => void;
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

    return (
        <div className="relative flex justify-center" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                title="Aksi"
            >
                <MoreVertical className="w-4 h-4" />
            </button>

            {isOpen && (
                <div
                    className="absolute right-0 top-full mt-2 w-48 py-1 rounded-xl z-[60] overflow-hidden shadow-2xl animate-[fadeIn_0.15s_ease-out]"
                    style={{
                        background: 'var(--card)',
                        border: '1px solid var(--border)',
                    }}
                >
                    <ul className="py-1">
                        {userPermissions.includes('product.edit') && (
                            <li
                                className="px-4 py-2 text-sm text-gray-200 hover:bg-white/5 cursor-pointer flex items-center gap-2 transition-colors"
                                onClick={() => {
                                    onEdit(product);
                                    setIsOpen(false);
                                }}
                            >
                                <Edit className="w-4 h-4 text-blue-400" />
                                <span>Edit Produk</span>
                            </li>
                        )}
                        <li
                            className="px-4 py-2 text-sm text-gray-200 hover:bg-white/5 cursor-pointer flex items-center gap-2 transition-colors"
                            onClick={() => {
                                onEditStock(product);
                                setIsOpen(false);
                            }}
                        >
                            <Settings2 className="w-4 h-4 text-cyan-400" />
                            <span>Edit Stok</span>
                        </li>
                        <li
                            className="px-4 py-2 text-sm text-gray-200 hover:bg-white/5 cursor-pointer flex items-center gap-2 transition-colors"
                            onClick={() => {
                                onViewStockHistory(product);
                                setIsOpen(false);
                            }}
                        >
                            <History className="w-4 h-4 text-orange-400" />
                            <span>Riwayat Stok</span>
                        </li>
                        {userPermissions.includes('product.delete') && (
                            <>
                                <div className="h-px bg-purple-500/10 my-1" />
                                <li
                                    className="px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 cursor-pointer flex items-center gap-2 transition-colors"
                                    onClick={() => {
                                        onDelete(product);
                                        setIsOpen(false);
                                    }}
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span>Hapus</span>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}

export interface SortConfig {
    key: string;
    direction: 'asc' | 'desc';
}

interface ProductsPageProps {
    products: ProductItem[]
    categories: Category[]
    onEditProduct: (product: ProductItem) => void
    onDeleteProduct: (product: ProductItem) => void
    onToggleStatus: (product: ProductItem) => void
    onImportProducts: (file: File) => void
    onExportProducts: () => void
    onOpenTransfer: () => void
    onOpenAdd: () => void
    onEditStock: (productId: string, payload: Record<string, any>) => Promise<void>
    onViewStockHistory: (product: ProductItem) => void
    // Pagination & Sorting props
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    sortConfig: SortConfig | null
    onSortChange: (key: string) => void
    searchQuery: string
    onSearchChange: (query: string) => void
    selectedCategoryId: string
    onCategoryChange: (categoryId: string) => void
}

export function ProductsPage({
    products,
    categories,
    onEditProduct,
    onDeleteProduct,
    onToggleStatus,
    onImportProducts,
    onExportProducts,
    onOpenTransfer,
    onOpenAdd,
    onEditStock,
    currentPage,
    totalPages,
    onPageChange,
    sortConfig,
    onSortChange,
    searchQuery,
    onSearchChange,
    selectedCategoryId,
    onCategoryChange,
    onViewStockHistory
}: ProductsPageProps) {
    const [userPermissions] = useState<string[]>(() => {
        try {
            const token = localStorage.getItem('token')
            if (token) {
                const payload = JSON.parse(atob(token.split('.')[1]))
                return payload.permissions || []
            }
        } catch {
            console.error('Failed to parse token permissions')
        }
        return []
    })

    const [editingStockProduct, setEditingStockProduct] = useState<ProductItem | null>(null)

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        onImportProducts(file)
        e.target.value = '' // Reset input
    }

    // Helper to render sort icon
    const renderSortIcon = (columnKey: string) => {
        if (sortConfig?.key !== columnKey) {
            return <span className="ml-1 opacity-20 text-[10px]">▼</span>
        }
        return sortConfig.direction === 'asc'
            ? <span className="ml-1 text-blue-400 text-[10px]">▲</span>
            : <span className="ml-1 text-blue-400 text-[10px]">▼</span>
    }

    return (
        <div className="flex-1 flex flex-col overflow-hidden h-full">
            <div className="flex-1 overflow-y-auto pb-24 md:pb-0">
                <div className="p-4 md:p-6 space-y-6">
                    {/* Header & Actions */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-xl md:text-2xl text-gray-200">Daftar Produk</h2>
                            <p className="text-sm text-gray-500 mt-1">Kelola data item yang ditawarkan</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {userPermissions.includes('product.import') && (
                                <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-purple-500/20 text-gray-400 hover:text-gray-200 hover:border-blue-500/50 transition-all cursor-pointer">
                                    <Upload className="w-4 h-4" />
                                    <span className="text-sm">Import</span>
                                    <input type="file" accept=".xlsx,.xls" onChange={handleImport} className="hidden" />
                                </label>
                            )}

                            {userPermissions.includes('product.export') && (
                                <button
                                    onClick={onExportProducts}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-purple-500/20 text-gray-400 hover:text-gray-200 hover:border-blue-500/50 transition-all cursor-pointer"
                                >
                                    <Download className="w-4 h-4" />
                                    <span className="text-sm">Export</span>
                                </button>
                            )}

                            {userPermissions.includes('product.transfer') && (
                                <button
                                    onClick={onOpenTransfer}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all cursor-pointer"
                                >
                                    <ArrowRightLeft className="w-4 h-4" />
                                    <span className="text-sm">Transfer Stok</span>
                                </button>
                            )}

                            {userPermissions.includes('product.create') && (
                                <button
                                    onClick={onOpenAdd}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all cursor-pointer"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span className="text-sm">Tambah Produk</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filter & Search */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="md:w-64">
                            <CategoryFilterSelect
                                value={selectedCategoryId}
                                categories={categories}
                                onChange={onCategoryChange}
                            />
                        </div>
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Cari berdasarkan nama atau kode SKU..."
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="w-full h-12 bg-white/5 border border-purple-500/20 rounded-xl pl-12 pr-4 text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all"
                            />
                        </div>
                    </div>

                    {/* Products Table */}
                    <div className="bg-white/5 backdrop-blur-xl border border-purple-500/20 rounded-xl overflow-hidden flex flex-col min-h-[400px]">
                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-left whitespace-nowrap">
                                <thead className="bg-white/5 border-b border-purple-500/20">
                                    <tr>
                                        <th className="px-4 py-4 text-sm font-medium text-gray-400 w-16">Foto</th>
                                        <th
                                            className="px-4 py-4 text-sm font-medium text-gray-400 cursor-pointer hover:text-blue-400 transition-colors select-none"
                                            onClick={() => onSortChange('sku')}
                                        >
                                            SKU {renderSortIcon('sku')}
                                        </th>
                                        <th
                                            className="px-4 py-4 text-sm font-medium text-gray-400 cursor-pointer hover:text-blue-400 transition-colors select-none"
                                            onClick={() => onSortChange('name')}
                                        >
                                            Nama Item {renderSortIcon('name')}
                                        </th>
                                        <th
                                            className="px-4 py-4 text-sm font-medium text-gray-400 cursor-pointer hover:text-blue-400 transition-colors select-none"
                                            onClick={() => onSortChange('kategori_name')}
                                        >
                                            Kategori {renderSortIcon('kategori_name')}
                                        </th>
                                        <th
                                            className="px-4 py-4 text-sm font-medium text-gray-400 text-right cursor-pointer hover:text-blue-400 transition-colors select-none"
                                            onClick={() => onSortChange('price')}
                                        >
                                            Harga Jual {renderSortIcon('price')}
                                        </th>
                                        <th
                                            className="px-4 py-4 text-sm font-medium text-gray-400 text-right w-24 cursor-pointer hover:text-blue-400 transition-colors select-none"
                                            onClick={() => onSortChange('stock')}
                                        >
                                            Stok {renderSortIcon('stock')}
                                        </th>
                                        <th className="px-4 py-4 text-sm font-medium text-gray-400 text-center w-20">
                                            Status
                                        </th>
                                        <th className="px-4 py-4 text-sm font-medium text-gray-400 text-center w-24">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-purple-500/10">
                                    {products.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-20 text-center">
                                                <div className="flex flex-col items-center justify-center text-gray-500">
                                                    <FileX className="w-12 h-12 mb-3 opacity-20" />
                                                    <p>Tidak ada produk ditemukan</p>
                                                    <p className="text-sm mt-1">Coba sesuaikan filter pencarian atau tambah data baru.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        products.map((product) => (
                                            <motion.tr
                                                key={product.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="hover:bg-white/5 transition-colors group"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 border border-purple-500/20">
                                                        {(product.image_url || product.image) ? (
                                                            <img
                                                                src={product.image_url || product.image}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    e.currentTarget.style.display = 'none'
                                                                    const parent = e.currentTarget.parentElement
                                                                    if (parent) {
                                                                        const icon = document.createElement('div')
                                                                        icon.className = "w-full h-full flex items-center justify-center bg-purple-500/5"
                                                                        icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-wrench text-purple-500/40"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`
                                                                        parent.appendChild(icon)
                                                                    }
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-purple-500/5">
                                                                <Wrench className="w-5 h-5 text-purple-500/40" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-400 font-mono">
                                                    {product.sku}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-200 font-medium">
                                                    {product.name}
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    <span className="text-gray-500">{product.kategori_name}</span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-200 text-right">
                                                    Rp {product.price.toLocaleString('id-ID')}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-right">
                                                    <span
                                                        className={`font-medium ${product.stock < 10
                                                            ? 'text-red-400'
                                                            : product.stock < 20
                                                                ? 'text-orange-400'
                                                                : 'text-green-400'
                                                            }`}
                                                    >
                                                        {product.stock}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        onClick={() => onToggleStatus!(product)}
                                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${product.is_active !== false
                                                            ? 'bg-green-500'
                                                            : 'bg-gray-600'
                                                            }`}
                                                        title={`${product.is_active !== false ? 'Nonaktifkan' : 'Aktifkan'} produk`}
                                                    >
                                                        <span
                                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${product.is_active !== false
                                                                ? 'translate-x-6'
                                                                : 'translate-x-1'
                                                                }`}
                                                        />
                                                    </button>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <ProductActionDropdown
                                                        product={product}
                                                        userPermissions={userPermissions}
                                                        onEdit={onEditProduct}
                                                        onDelete={onDeleteProduct}
                                                        onEditStock={() => setEditingStockProduct(product)}
                                                        onViewStockHistory={onViewStockHistory}
                                                    />
                                                </td>
                                            </motion.tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Footer */}
                        {totalPages > 0 && (
                            <div className="flex items-center justify-between px-6 py-4 border-t border-purple-500/20" style={{ background: 'var(--surface-overlay)' }}>
                                <p className="text-sm text-gray-400">
                                    Halaman <span className="font-medium text-gray-200">{currentPage}</span> dari <span className="font-medium text-gray-200">{totalPages}</span>
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => onPageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="p-2 rounded-lg border border-purple-500/20 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>

                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                                            // Simple pagination logic focusing around current page
                                            let pageNum = i + 1;
                                            if (totalPages > 5 && currentPage > 3) {
                                                pageNum = currentPage - 2 + i;
                                                if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                                            }

                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => onPageChange(pageNum)}
                                                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all ${currentPage === pageNum
                                                        ? 'bg-blue-500 text-white font-medium shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                                        }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            )
                                        })}
                                    </div>

                                    <button
                                        onClick={() => onPageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="p-2 rounded-lg border border-purple-500/20 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <EditStockModal
                isOpen={!!editingStockProduct}
                onClose={() => setEditingStockProduct(null)}
                product={editingStockProduct}
                onSave={async (productId, payload) => {
                    try {
                        await onEditStock(productId, payload)
                        setEditingStockProduct(null)
                    } catch (error) {
                        toast.error('Gagal memperbarui stok')
                        console.error(error)
                    }
                }}
            />
        </div>
    )
}
