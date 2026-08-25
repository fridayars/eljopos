import { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, Search, Edit, Trash2, Users, XCircle, Loader2, ChevronsUpDown, ChevronUp, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'motion/react'
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../services/customerService'
import type { Customer } from '../services/customerService'
import { CustomerModal } from '../components/customers/CustomerModal'
import { DeleteConfirmationModal } from '../components/inventory/DeleteConfirmationModal'
import { useNavigate } from 'react-router-dom'

type SortKey = 'name' | 'phone' | 'email' | 'created_at' | 'transaction_count'
type SortDir = 'asc' | 'desc'

function SortIcon({ column, sortKey, sortDir }: { column: SortKey; sortKey: SortKey | null; sortDir: SortDir }) {
    if (sortKey !== column) return <ChevronsUpDown className="w-3.5 h-3.5 opacity-30 ml-1 inline" />
    return sortDir === 'asc'
        ? <ChevronUp className="w-3.5 h-3.5 ml-1 inline text-indigo-400" />
        : <ChevronDown className="w-3.5 h-3.5 ml-1 inline text-indigo-400" />
}

export function CustomersPage() {
    // Data States
    const [customers, setCustomers] = useState<Customer[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [hasMore, setHasMore] = useState(true)

    // Pagination & Search States
    const [currentPage, setCurrentPage] = useState(1)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const limit = 20

    // Sort States
    const [sortKey, setSortKey] = useState<SortKey | null>(null)
    const [sortDir, setSortDir] = useState<SortDir>('desc')

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null)

    const navigate = useNavigate()

    // Infinite scroll trigger ref
    const loadMoreRef = useRef<HTMLDivElement>(null)

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

    const canCreate = userPermissions.includes('customer.create')
    const canEdit = userPermissions.includes('customer.edit')
    const canDelete = userPermissions.includes('customer.delete')

    const fetchCustomers = useCallback(async (page: number, reset: boolean = false) => {
        if (page === 1) setIsLoading(true)
        else setIsLoadingMore(true)

        try {
            const sortParam = sortKey ? `${sortKey}:${sortDir}` : undefined
            const res = await getCustomers({ page, limit, search: searchQuery, sort: sortParam })

            if (res.success) {
                const newItems = res.data.items
                setCustomers(prev => reset ? newItems : [...prev, ...newItems])
                const totalPages = res.data.pagination.total_pages
                setHasMore(page < totalPages)
                setCurrentPage(page)
            } else {
                toast.error(res.message || 'Gagal memuat pelanggan')
            }
        } catch {
            toast.error('Terjadi kesalahan saat memuat data')
        } finally {
            setIsLoading(false)
            setIsLoadingMore(false)
        }
    }, [searchQuery, sortKey, sortDir, limit])

    // Initial load & reset on filter change
    useEffect(() => {
        fetchCustomers(1, true)
    }, [fetchCustomers])

    // Infinite scroll observer
    useEffect(() => {
        const el = loadMoreRef.current
        if (!el) return
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoadingMore && !isLoading) {
                    fetchCustomers(currentPage + 1, false)
                }
            },
            { threshold: 0.1 }
        )
        observer.observe(el)
        return () => observer.disconnect()
    }, [hasMore, isLoadingMore, isLoading, currentPage, fetchCustomers])

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setSearchQuery(searchTerm)
    }

    const handleClearSearch = () => {
        setSearchTerm('')
        setSearchQuery('')
    }

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')
        } else {
            setSortKey(key)
            setSortDir('asc')
        }
    }

    const openAdd = () => {
        setEditingCustomer(null)
        setIsModalOpen(true)
    }

    const openEdit = (customer: Customer) => {
        setEditingCustomer(customer)
        setIsModalOpen(true)
    }

    const openDelete = (customer: Customer) => {
        setCustomerToDelete(customer)
        setIsDeleteModalOpen(true)
    }

    const handleSave = async (id: string | null, data: any) => {
        if (id) {
            const res = await updateCustomer(id, data)
            if (res.success) {
                toast.success('Pelanggan berhasil diupdate')
                fetchCustomers(1, true)
            } else {
                toast.error(res.message || 'Gagal update pelanggan')
                throw new Error('Failed to update')
            }
        } else {
            const res = await createCustomer(data)
            if (res.success) {
                toast.success('Pelanggan baru berhasil ditambahkan')
                fetchCustomers(1, true)
            } else {
                toast.error(res.message || 'Gagal menambah pelanggan')
                throw new Error('Failed to create')
            }
        }
    }

    const handleDelete = async () => {
        if (!customerToDelete) return
        try {
            const res = await deleteCustomer(customerToDelete.id)
            if (res.success) {
                toast.success('Pelanggan berhasil dihapus')
                fetchCustomers(1, true)
            } else {
                toast.error(res.message || 'Gagal menghapus pelanggan')
            }
        } catch {
            toast.error('Terjadi kesalahan saat menghapus')
        } finally {
            setIsDeleteModalOpen(false)
            setCustomerToDelete(null)
        }
    }

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '-'
        return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(dateStr))
    }

    const getFullAddress = (customer: Customer) => {
        const parts = [
            customer.address,
            customer.district_name,
            customer.regency_name,
            customer.province_name
        ].filter(Boolean)
        return parts.length > 0 ? parts.join(', ') : '-'
    }

    const thClass = (key: SortKey) =>
        `px-6 py-4 cursor-pointer select-none whitespace-nowrap hover:text-indigo-400 transition-colors ${sortKey === key ? 'text-indigo-400' : ''}`

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden p-6 gap-6 relative" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-indigo-500/20 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                        <Users className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight drop-shadow-sm" style={{ color: 'var(--foreground)' }}>Pelanggan</h1>
                        <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Kelola data pelanggan</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <form onSubmit={handleSearchSubmit} className="relative w-full md:w-64">
                        <input
                            className="w-full pl-10 pr-10 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                            style={{ background: 'var(--surface-subtle)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                            placeholder="Cari nama/telepon..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                        {searchTerm && (
                            <button type="button" onClick={handleClearSearch} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }}>
                                <XCircle className="w-4 h-4" />
                            </button>
                        )}
                    </form>

                    {canCreate && (
                        <button
                            onClick={openAdd}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-sm font-medium transition-all shadow-[0_4px_20px_rgba(99,102,241,0.3)] hover:shadow-[0_4px_25px_rgba(99,102,241,0.5)] transform hover:-translate-y-0.5"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Tambah Pelanggan</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Table Area */}
            <div className="flex-1 overflow-hidden relative z-10 flex flex-col border rounded-2xl shadow-xl" style={{ background: 'var(--card)', borderColor: 'var(--border-subtle)' }}>
                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left whitespace-nowrap">
                            <thead className="sticky top-0 text-xs uppercase font-semibold tracking-wider z-20 border-b shadow-sm" style={{ background: 'var(--surface-overlay)', color: 'var(--muted-foreground)', borderColor: 'var(--border-subtle)' }}>
                                <tr>
                                    <th className="px-6 py-4">Aksi</th>
                                    <th className={thClass('name')} onClick={() => handleSort('name')}>
                                        Nama Pelanggan <SortIcon column="name" sortKey={sortKey} sortDir={sortDir} />
                                    </th>
                                    <th className={thClass('phone')} onClick={() => handleSort('phone')}>
                                        No. Telepon <SortIcon column="phone" sortKey={sortKey} sortDir={sortDir} />
                                    </th>
                                    <th className={thClass('email')} onClick={() => handleSort('email')}>
                                        Email <SortIcon column="email" sortKey={sortKey} sortDir={sortDir} />
                                    </th>
                                    <th className="px-6 py-4">Alamat</th>
                                    <th className={thClass('transaction_count')} onClick={() => handleSort('transaction_count')}>
                                        Jml. Transaksi <SortIcon column="transaction_count" sortKey={sortKey} sortDir={sortDir} />
                                    </th>
                                    <th className={thClass('created_at')} onClick={() => handleSort('created_at')}>
                                        Bergabung <SortIcon column="created_at" sortKey={sortKey} sortDir={sortDir} />
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {customers.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-16 text-center text-gray-500">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                                                    <Search className="w-8 h-8 text-gray-600" />
                                                </div>
                                                <p>Tidak ada data pelanggan ditemukan.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    customers.map((customer, idx) => (
                                        <motion.tr
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: Math.min(idx * 0.03, 0.3) }}
                                            key={customer.id}
                                            className="hover:bg-white/[0.02] transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2" style={{ color: 'var(--muted-foreground)' }}>
                                                    {canEdit && (
                                                        <button
                                                            onClick={() => openEdit(customer)}
                                                            className="p-2 rounded-xl transition-all hover:opacity-80" style={{ background: 'var(--surface-subtle)' }}
                                                            title="Edit"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {canDelete && (
                                                        <button
                                                            onClick={() => openDelete(customer)}
                                                            className="p-2 rounded-xl transition-all hover:opacity-80" style={{ background: 'var(--surface-subtle)' }}
                                                            title="Hapus"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium" style={{ color: 'var(--foreground)' }}>{customer.name}</div>
                                            </td>
                                            <td className="px-6 py-4" style={{ color: 'var(--muted-foreground)' }}>
                                                {customer.phone || '-'}
                                            </td>
                                            <td className="px-6 py-4" style={{ color: 'var(--muted-foreground)' }}>
                                                {customer.email || '-'}
                                            </td>
                                            <td className="px-6 py-4 relative group" style={{ color: 'var(--muted-foreground)' }}>
                                                {getFullAddress(customer) !== '-' ? (
                                                    <>
                                                        <span className="truncate block max-w-[200px] sm:max-w-xs cursor-default">{getFullAddress(customer)}</span>
                                                        <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 absolute left-6 bottom-full mb-1 z-[100] p-3 rounded-xl text-xs whitespace-normal w-max max-w-sm shadow-[0_4px_20px_rgba(0,0,0,0.3)] pointer-events-none" style={{ background: 'var(--surface-overlay)', color: 'var(--foreground)', border: '1px solid var(--border-subtle)' }}>
                                                            {getFullAddress(customer)}
                                                        </div>
                                                    </>
                                                ) : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {customer.transaction_count! > 0 ? (
                                                    <button
                                                        onClick={() => navigate(`/customers/${customer.id}/transactions`)}
                                                        className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 hover:border-indigo-500/40 transition-all cursor-pointer"
                                                        title="Lihat Riwayat Transaksi"
                                                    >
                                                        {customer.transaction_count}
                                                    </button>
                                                ) : (
                                                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-500/10 text-gray-500 border border-gray-500/20">
                                                        0
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                                                {formatDate(customer.created_at)}
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>

                        {/* Infinite scroll trigger */}
                        <div ref={loadMoreRef} className="h-16 flex items-center justify-center">
                            {isLoadingMore && (
                                <div className="flex items-center gap-2" style={{ color: 'var(--muted-foreground)' }}>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="text-sm">Memuat lebih banyak...</span>
                                </div>
                            )}
                            {!hasMore && customers.length > 0 && (
                                <p className="text-xs italic" style={{ color: 'var(--muted-foreground)' }}>Semua pelanggan telah dimuat</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Decorative Background */}
            <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] rounded-full pointer-events-none opacity-[0.02] blur-[100px] bg-indigo-500" />
            <div className="absolute bottom-[20%] left-[10%] w-[300px] h-[300px] rounded-full pointer-events-none opacity-[0.02] blur-[80px] bg-purple-500" />

            {/* Modals */}
            <CustomerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                customer={editingCustomer}
                onSave={handleSave}
            />

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false)
                    setCustomerToDelete(null)
                }}
                onConfirm={handleDelete}
                itemName={customerToDelete?.name || 'Pelanggan ini'}
            />
        </div>
    )
}
