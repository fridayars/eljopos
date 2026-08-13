import { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, Search, Edit, Trash2, Store as StoreIcon, XCircle, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'motion/react'
import { getStores, createStore, updateStore, toggleStoreStatus, deleteStore } from '../services/storeService'
import type { Store } from '../services/storeService'
import { StoreModal } from '../components/stores/StoreModal'
import { DeleteConfirmationModal } from '../components/inventory/DeleteConfirmationModal'

export function StoresPage() {
    // Data States
    const [stores, setStores] = useState<Store[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isFetchingMore, setIsFetchingMore] = useState(false)
    const [hasMore, setHasMore] = useState(true)

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

    // Pagination & Search States
    const [page, setPage] = useState(1)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const limit = 15

    const observer = useRef<IntersectionObserver | null>(null)
    const lastStoreElementRef = useCallback((node: HTMLTableRowElement | null) => {
        if (isLoading || isFetchingMore) return
        if (observer.current) observer.current.disconnect()
        
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1)
            }
        })
        
        if (node) observer.current.observe(node)
    }, [isLoading, isFetchingMore, hasMore])

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingStore, setEditingStore] = useState<Store | null>(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [storeToDelete, setStoreToDelete] = useState<Store | null>(null)

    const fetchStores = useCallback(async (currentPage: number, search: string, isNewSearch = false) => {
        if (isNewSearch) {
            setIsLoading(true)
        } else {
            setIsFetchingMore(true)
        }
        
        try {
            const res = await getStores({ page: currentPage, limit, search })
            
            if (res.success) {
                if (isNewSearch) {
                    setStores(res.data.items)
                } else {
                    setStores(prev => [...prev, ...res.data.items])
                }
                setHasMore(currentPage < res.data.total_pages)
            } else {
                toast.error(res.message || 'Gagal memuat cabang')
            }
        } catch (error) {
            toast.error('Terjadi kesalahan saat memuat data')
        } finally {
            setIsLoading(false)
            setIsFetchingMore(false)
        }
    }, [])

    // Load initial data or when search changes
    useEffect(() => {
        setPage(1)
        setHasMore(true)
        fetchStores(1, searchQuery, true)
    }, [searchQuery, fetchStores])

    // Fetch more when page changes
    useEffect(() => {
        if (page > 1) {
            fetchStores(page, searchQuery, false)
        }
    }, [page, searchQuery, fetchStores])

    // Handle Search Submit
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setSearchQuery(searchTerm)
    }

    const handleClearSearch = () => {
        setSearchTerm('')
        setSearchQuery('')
    }

    // Modal Handlers
    const openAddModal = () => {
        setEditingStore(null)
        setIsModalOpen(true)
    }

    const openEditModal = (store: Store) => {
        setEditingStore(store)
        setIsModalOpen(true)
    }

    const openDeleteModal = (store: Store) => {
        setStoreToDelete(store)
        setIsDeleteModalOpen(true)
    }

    // CRUD Operations
    const handleSaveStore = async (id: string | null, data: any) => {
        if (id) {
            const res = await updateStore(id, data)
            if (res.success) {
                toast.success('Cabang berhasil diupdate')
                // Reload current state instead of going back to page 1
                setPage(1)
                fetchStores(1, searchQuery, true)
            } else {
                toast.error(res.message || 'Gagal update cabang')
                throw new Error('Failed to update')
            }
        } else {
            const res = await createStore(data)
            if (res.success) {
                toast.success('Cabang baru berhasil ditambahkan')
                setPage(1)
                fetchStores(1, searchQuery, true)
            } else {
                toast.error(res.message || 'Gagal menambah cabang')
                throw new Error('Failed to create')
            }
        }
    }

    const handleDeleteStore = async () => {
        if (!storeToDelete) return
        
        try {
            const res = await deleteStore(storeToDelete.id)
            if (res.success) {
                toast.success('Cabang berhasil dihapus')
                setStores(prev => prev.filter(s => s.id !== storeToDelete.id))
            } else {
                toast.error(res.message || 'Gagal menghapus cabang')
            }
        } catch (error) {
            toast.error('Terjadi kesalahan saat menghapus')
        } finally {
            setIsDeleteModalOpen(false)
            setStoreToDelete(null)
        }
    }

    const handleToggleStatus = async (store: Store) => {
        try {
            const res = await toggleStoreStatus(store.id)
            if (res.success) {
                setStores(stores.map(s => 
                    s.id === store.id ? { ...s, is_active: !s.is_active } : s
                ))
                toast.success('Berhasil mengubah status cabang')
            } else {
                toast.error(res.message || 'Gagal mengubah status')
            }
        } catch (error) {
            toast.error('Gagal mengubah status cabang')
        }
    }

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden p-6 gap-6 relative" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
             {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-blue-500/20 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                        <StoreIcon className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight drop-shadow-sm" style={{ color: 'var(--foreground)' }}>Manajemen Cabang</h1>
                        <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                            Kelola data toko dan cabang
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <form onSubmit={handleSearchSubmit} className="relative w-full md:w-64">
                        <input
                            className="w-full pl-10 pr-10 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                            style={{ background: 'var(--surface-subtle)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                            placeholder="Cari cabang..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }}
                            >
                                <XCircle className="w-4 h-4" />
                            </button>
                        )}
                    </form>

                    {(!userPermissions.length || userPermissions.includes('store.create')) && (
                        <button
                            onClick={openAddModal}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-sm font-medium transition-all shadow-[0_4px_20px_rgba(59,130,246,0.3)] hover:shadow-[0_4px_25px_rgba(59,130,246,0.5)] transform hover:-translate-y-0.5"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Tambah Cabang</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Table Area with Infinite Scroll */}
            <div className="flex-1 overflow-hidden relative z-10 flex flex-col border rounded-2xl shadow-xl" style={{ background: 'var(--card)', borderColor: 'var(--border-subtle)' }}>
                {isLoading && page === 1 ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left whitespace-nowrap">
                            <thead className="sticky top-0 text-xs uppercase font-semibold tracking-wider z-20 border-b shadow-sm" style={{ background: 'var(--surface-overlay)', color: 'var(--muted-foreground)', borderColor: 'var(--border-subtle)' }}>
                                <tr>
                                    <th className="px-6 py-4">Nama Cabang</th>
                                    <th className="px-6 py-4">Alamat & Telepon</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {stores.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-16 text-center text-gray-500">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                                                    <StoreIcon className="w-8 h-8 text-gray-600" />
                                                </div>
                                                <p>Tidak ada data cabang ditemukan.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    stores.map((store, idx) => {
                                        const isLastElement = stores.length === idx + 1
                                        return (
                                            <motion.tr 
                                                ref={isLastElement ? lastStoreElementRef : null}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.2 }}
                                                key={store.id} 
                                                className="transition-colors hover:bg-white/[0.02]"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="font-medium" style={{ color: 'var(--foreground)' }}>{store.name}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="text-sm truncate max-w-[200px] lg:max-w-[400px]" style={{ color: 'var(--foreground)' }}>
                                                            {store.address || '-'}
                                                        </div>
                                                        {store.phone && (
                                                            <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                                                {store.phone}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {(!userPermissions.length || userPermissions.includes('store.edit')) ? (
                                                        <button 
                                                            onClick={() => handleToggleStatus(store)}
                                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                                                store.is_active 
                                                                ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 ring-1 ring-emerald-500/20' 
                                                                : 'bg-red-500/10 text-red-500 hover:bg-red-500/20 ring-1 ring-red-500/20'
                                                            }`}
                                                        >
                                                            {store.is_active ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                                            {store.is_active ? 'Aktif' : 'Nonaktif'}
                                                        </button>
                                                    ) : (
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                                                            store.is_active 
                                                            ? 'bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20' 
                                                            : 'bg-red-500/10 text-red-500 ring-1 ring-red-500/20'
                                                        }`}>
                                                            {store.is_active ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                                            {store.is_active ? 'Aktif' : 'Nonaktif'}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2" style={{ color: 'var(--muted-foreground)' }}>
                                                        {(!userPermissions.length || userPermissions.includes('store.edit')) && (
                                                            <button 
                                                                onClick={() => openEditModal(store)}
                                                                className="p-2 rounded-xl transition-all hover:text-blue-500 hover:bg-blue-500/10"
                                                                title="Edit"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        {(!userPermissions.length || userPermissions.includes('store.delete')) && (
                                                            <button 
                                                                onClick={() => openDeleteModal(store)}
                                                                className="p-2 rounded-xl transition-all hover:text-red-500 hover:bg-red-500/10"
                                                                title="Hapus"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        )
                                    })
                                )}
                                {isFetchingMore && (
                                    <tr>
                                        <td colSpan={4} className="py-6 text-center">
                                            <div className="flex items-center justify-center gap-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                                                <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                                                Memuat lagi...
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Decorative Background */}
            <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] rounded-full pointer-events-none opacity-[0.02] blur-[100px] bg-blue-500" />
            <div className="absolute bottom-[20%] left-[10%] w-[300px] h-[300px] rounded-full pointer-events-none opacity-[0.02] blur-[80px] bg-indigo-500" />

            {/* Modals */}
            <StoreModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                store={editingStore}
                onSave={handleSaveStore}
            />

            <DeleteConfirmationModal 
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false)
                    setStoreToDelete(null)
                }}
                onConfirm={handleDeleteStore}
                itemName={storeToDelete?.name || 'Cabang ini'}
            />
        </div>
    )
}
