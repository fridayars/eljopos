import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, Edit, Trash2, Package, Box } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'motion/react'
import { getProducts, getCategories, addCategory, updateCategory, deleteCategory, addProduct, updateProduct, deleteProduct, updateProductStatus, importProductsFile, exportProductsFile } from '../services/productService'
import { getBranches } from '../services/branchService'
import type { ProductItem, Category } from '../services/productService'
import type { Branch } from '../services/branchService'

import { ProductsPage } from '../components/inventory/ProductsPage'
import type { SortConfig } from '../components/inventory/ProductsPage'
import { EditProductModal } from '../components/inventory/EditProductModal'
import { StockTransferModal } from '../components/inventory/StockTransferModal'
import { AddCategoryModal } from '../components/inventory/AddCategoryModal'
import { EditCategoryModal } from '../components/inventory/EditCategoryModal'
import { DeleteConfirmationModal } from '../components/inventory/DeleteConfirmationModal'

type InventoryTab = 'product-category' | 'produk-barang'

export function ProductInventoryPage() {
    const [activeTab, setActiveTab] = useState<InventoryTab>('produk-barang')

    // Data States
    const [products, setProducts] = useState<ProductItem[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [branches, setBranches] = useState<Branch[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Category States
    const [searchCategory, setSearchCategory] = useState('')
    const [isAddCatOpen, setIsAddCatOpen] = useState(false)
    const [isEditCatOpen, setIsEditCatOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [isDeleteCatOpen, setIsDeleteCatOpen] = useState(false)
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)

    // Product States
    const [isEditProdOpen, setIsEditProdOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null)
    const [isTransferOpen, setIsTransferOpen] = useState(false)
    const [isDeleteProdOpen, setIsDeleteProdOpen] = useState(false)
    const [productToDelete, setProductToDelete] = useState<ProductItem | null>(null)

    // Product Pagination & Sorting States
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [searchQuery, setSearchQuery] = useState('')
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null)
    const pageSize = 10

    const fetchProducts = useCallback(async () => {
        try {
            const params = {
                page: currentPage,
                limit: pageSize,
                search: searchQuery || undefined,
                sort: sortConfig ? `${sortConfig.key}:${sortConfig.direction}` : undefined
            }

            const prodRes = await getProducts(params)

            if (prodRes.success) {
                setProducts(prodRes.data.items)
                setTotalPages(prodRes.data.pagination?.total_pages || 1)
            }
        } catch (error) {
            toast.error('Gagal memuat data produk')
        }
    }, [currentPage, searchQuery, sortConfig])

    const loadInitialData = useCallback(async () => {
        setIsLoading(true)
        try {
            const [catRes, branchRes] = await Promise.all([
                getCategories(),
                getBranches()
            ])

            if (catRes.success) {
                setCategories(catRes.data)
            } else {
                toast.error(`Gagal load kategori dari server`)
            }
            if (branchRes.success) setBranches(branchRes.data)

            // Also fetch products for the first load
            await fetchProducts()
        } catch (error) {
            toast.error('Gagal memuat data inventaris')
        } finally {
            setIsLoading(false)
        }
    }, [fetchProducts])

    useEffect(() => {
        loadInitialData()
    }, []) // Run only once on mount

    useEffect(() => {
        // Only run fetchProducts if it's not the initial loading (already handled by loadInitialData)
        if (!isLoading) {
            fetchProducts()
        }
    }, [currentPage, searchQuery, sortConfig, isLoading, fetchProducts])

    const handleSortChange = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc'
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc'
        }
        setSortConfig({ key, direction })
    }

    /* --- Category Handlers --- */
    const filteredCategories = categories.filter((cat) =>
        cat.name.toLowerCase().includes(searchCategory.toLowerCase())
    )

    const handleAddCategory = async (newCat: { name: string; description: string }) => {
        const res = await addCategory({ name: newCat.name, description: newCat.description })
        if (res.success && res.data) {
            setCategories([...categories, res.data])
            toast.success('Kategori berhasil ditambahkan')
            setIsAddCatOpen(false)
        } else {
            toast.error(res.message || 'Gagal menambahkan kategori')
        }
    }

    const handleEditCategory = async (id: string, updates: { name: string; description?: string }) => {
        const res = await updateCategory(id, updates)
        if (res.success && res.data) {
            const updatedCats = categories.map(c => c.id === id ? { ...c, ...res.data } : c)
            setCategories(updatedCats)
            toast.success('Kategori berhasil diperbarui')
            setIsEditCatOpen(false)
        } else {
            toast.error(res.message || 'Gagal memperbarui kategori')
        }
    }

    const handleRequestDeleteCategory = (cat: Category) => {
        setCategoryToDelete(cat)
        setIsDeleteCatOpen(true)
    }

    const handleConfirmDeleteCategory = async () => {
        if (!categoryToDelete) return
        const res = await deleteCategory(categoryToDelete.id)
        if (res.success) {
            const updatedCats = categories.filter(c => c.id !== categoryToDelete.id)
            setCategories(updatedCats)
            toast.success('Kategori berhasil dihapus')
        } else {
            toast.error(res.message || 'Gagal menghapus kategori')
        }
        setIsDeleteCatOpen(false)
        setCategoryToDelete(null)
    }

    const openEditCategory = (cat: Category) => {
        setEditingCategory(cat)
        setIsEditCatOpen(true)
    }

    /* --- Product Handlers --- */
    const saveProduct = async (id: string, updates: Record<string, any>) => {
        if (editingProduct === null) {
            // It's a new product
            const res = await addProduct(updates as any)
            if (res.success && res.data) {
                toast.success('Produk berhasil ditambahkan')
                setIsEditProdOpen(false)
                fetchProducts()
            } else {
                toast.error('Gagal menambahkan produk')
            }
        } else {
            // It's an update
            const res = await updateProduct(id, updates)
            if (res.success && res.data) {
                toast.success('Produk berhasil diperbarui')
                setIsEditProdOpen(false)
                fetchProducts()
            } else {
                toast.error('Gagal memperbarui produk')
            }
        }
    }

    const startAddProduct = () => {
        setEditingProduct(null)
        setIsEditProdOpen(true)
    }

    const startEditProduct = (prod: ProductItem) => {
        setEditingProduct(prod)
        setIsEditProdOpen(true)
    }

    const handleRequestDeleteProduct = (prod: ProductItem) => {
        setProductToDelete(prod)
        setIsDeleteProdOpen(true)
    }

    const handleConfirmDeleteProduct = async () => {
        if (!productToDelete) return
        const res = await deleteProduct(productToDelete.id)
        if (res.success) {
            toast.success('Produk berhasil dihapus')
            fetchProducts()
        } else {
            toast.error('Gagal menghapus produk')
        }
        setIsDeleteProdOpen(false)
        setProductToDelete(null)
    }

    const handleToggleProductStatus = async (prod: ProductItem) => {
        const newStatus = (prod as any).is_active === false ? true : false
        const res = await updateProductStatus(prod.id, newStatus)
        if (res.success) {
            setProducts(products.map(p => p.id === prod.id ? { ...p, is_active: newStatus } as any : p))
            toast.success(`Produk ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}`)
        } else {
            toast.error(res.message || 'Gagal mengubah status produk')
        }
    }

    const handleImportProducts = async (file: File) => {
        const response = await importProductsFile(file)
        if (response.success) {
            toast.success(response.message || 'Produk berhasil diimport')
            fetchProducts()
        } else {
            toast.error(response.message || 'Gagal mengimport produk')
        }
    }

    const handleExportProducts = async () => {
        const toastId = toast.loading('Sedang mengunduh file export...')
        const response = await exportProductsFile()
        if (response.success) {
            toast.success('Berhasil mengekspor produk', { id: toastId })
        } else {
            toast.error(response.message || 'Gagal mengekspor data produk', { id: toastId })
        }
    }

    const handleTransferStock = (data: any) => {
        const sourceName = branches.find((b) => b.id === data.sourceBranch)?.name
        const destName = branches.find((b) => b.id === data.destinationBranch)?.name

        const itemsList = data.items.map((item: any) => `${item.quantity}x ${item.productName}`).join(', ')
        toast.success(`Berhasil transfer dari ${sourceName} ke ${destName}: ${itemsList}`)

        // Refresh products list from DB to reflect correct stock changes
        fetchProducts()
    }

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
            </div>
        )
    }

    console.log('DEBUG RENDER:', { categories, filteredCategories, searchCategory });

    return (
        <div className="flex-1 flex flex-col overflow-hidden h-full">
            {/* Header / Tabs Container */}
            <div className="p-4 md:p-6 border-b border-purple-500/10 shrink-0 bg-[#0F0F14]/50">
                <div className="flex flex-col gap-4">
                    <div>
                        <h2 className="text-lg md:text-xl text-gray-200">Manajemen Inventaris</h2>
                        <p className="text-xs md:text-sm text-gray-500 mt-1">
                            Kelola kategori, daftar barang, dan perpindahan stok
                        </p>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
                        <button
                            onClick={() => setActiveTab('product-category')}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm whitespace-nowrap transition-all ${activeTab === 'product-category'
                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                                : 'bg-white/5 border border-purple-500/20 text-gray-400 hover:text-gray-200 hover:border-blue-500/50'
                                }`}
                        >
                            <Package className="w-4 h-4" />
                            Kategori Produk
                        </button>
                        <button
                            onClick={() => setActiveTab('produk-barang')}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm whitespace-nowrap transition-all ${activeTab === 'produk-barang'
                                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                                : 'bg-white/5 border border-purple-500/20 text-gray-400 hover:text-gray-200 hover:border-blue-500/50'
                                }`}
                        >
                            <Box className="w-4 h-4" />
                            Produk Barang
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative">
                <AnimatePresence mode="wait">
                    {/* --- CATEGORY TAB --- */}
                    {activeTab === 'product-category' && (
                        <motion.div
                            key="category-tab"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0 flex flex-col"
                        >
                            <div className="p-4 md:p-6 border-b border-purple-500/10 shrink-0">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                        <input
                                            type="text"
                                            placeholder="Cari kategori produk..."
                                            value={searchCategory}
                                            onChange={(e) => setSearchCategory(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-purple-500/20 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all"
                                        />
                                    </div>
                                    <button
                                        onClick={() => setIsAddCatOpen(true)}
                                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all cursor-pointer"
                                    >
                                        <Plus className="w-5 h-5" />
                                        Tambah Kategori
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                    {filteredCategories.length === 0 ? (
                                        <div className="col-span-full py-12 text-center text-gray-500">
                                            Tidak ada kategori ditemukan.
                                        </div>
                                    ) : (
                                        filteredCategories.map((category) => (
                                            <motion.div
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                key={category.id}
                                                className="bg-white/5 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-5 hover:border-blue-500/40 transition-all group"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h3 className="text-lg font-medium text-gray-200">
                                                                {category.name}
                                                            </h3>
                                                        </div>
                                                        <p className="text-sm text-gray-500 line-clamp-2">
                                                            {category.description || 'Tidak ada deskripsi spesifik.'}
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-col gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => openEditCategory(category)}
                                                            className="p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/20 transition-all cursor-pointer"
                                                            title="Edit"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleRequestDeleteCategory(category)}
                                                            className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 hover:bg-red-500/20 transition-all cursor-pointer"
                                                            title="Hapus"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* --- PRODUCTS TAB --- */}
                    {activeTab === 'produk-barang' && (
                        <motion.div
                            key="product-tab"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0"
                        >
                            <ProductsPage
                                products={products}
                                onEditProduct={startEditProduct}
                                onDeleteProduct={handleRequestDeleteProduct}
                                onToggleStatus={handleToggleProductStatus}
                                onImportProducts={handleImportProducts}
                                onExportProducts={handleExportProducts}
                                onOpenTransfer={() => setIsTransferOpen(true)}
                                onOpenAdd={startAddProduct}
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                sortConfig={sortConfig}
                                onSortChange={handleSortChange}
                                searchQuery={searchQuery}
                                onSearchChange={(val) => {
                                    setSearchQuery(val)
                                    setCurrentPage(1)
                                }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Modals */}
            <AddCategoryModal
                isOpen={isAddCatOpen}
                onClose={() => setIsAddCatOpen(false)}
                onAdd={handleAddCategory}
            />

            <EditCategoryModal
                isOpen={isEditCatOpen}
                onClose={() => setIsEditCatOpen(false)}
                category={editingCategory}
                onSave={handleEditCategory}
            />

            <EditProductModal
                isOpen={isEditProdOpen}
                onClose={() => setIsEditProdOpen(false)}
                product={editingProduct}
                categories={categories}
                onSave={saveProduct}
            />

            <StockTransferModal
                isOpen={isTransferOpen}
                onClose={() => setIsTransferOpen(false)}
                products={products}
                branches={branches}
                onTransfer={handleTransferStock}
            />

            <DeleteConfirmationModal
                isOpen={isDeleteCatOpen}
                onClose={() => {
                    setIsDeleteCatOpen(false)
                    setCategoryToDelete(null)
                }}
                onConfirm={handleConfirmDeleteCategory}
                itemName={categoryToDelete?.name || ''}
            />

            <DeleteConfirmationModal
                isOpen={isDeleteProdOpen}
                onClose={() => {
                    setIsDeleteProdOpen(false)
                    setProductToDelete(null)
                }}
                onConfirm={handleConfirmDeleteProduct}
                itemName={productToDelete?.name || ''}
            />
        </div>
    )
}
