import { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, Search, Edit, Trash2, UserCheck, XCircle, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'motion/react'
import { getStaff, createStaff, updateStaff, toggleStaffStatus, deleteStaff } from '../services/staffService'
import type { Staff } from '../services/staffService'
import { StaffModal } from '../components/staff/StaffModal'
import { DeleteConfirmationModal } from '../components/inventory/DeleteConfirmationModal'

export function StaffPage() {
    // Data States
    const [staffList, setStaffList] = useState<Staff[]>([])
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

    // Pagination & Search
    const [page, setPage] = useState(1)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const limit = 15

    const observer = useRef<IntersectionObserver | null>(null)
    const lastRowRef = useCallback((node: HTMLTableRowElement | null) => {
        if (isLoading || isFetchingMore) return
        if (observer.current) observer.current.disconnect()
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prev => prev + 1)
            }
        })
        if (node) observer.current.observe(node)
    }, [isLoading, isFetchingMore, hasMore])

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null)

    const fetchData = useCallback(async (currentPage: number, search: string, isNewSearch = false) => {
        if (isNewSearch) {
            setIsLoading(true)
        } else {
            setIsFetchingMore(true)
        }

        try {
            const res = await getStaff({ page: currentPage, limit, search })
            if (res.success) {
                if (isNewSearch) {
                    setStaffList(res.data.items)
                } else {
                    setStaffList(prev => [...prev, ...res.data.items])
                }
                setHasMore(currentPage < res.data.total_pages)
            } else {
                toast.error(res.message || 'Gagal memuat data staff')
            }
        } catch {
            toast.error('Terjadi kesalahan saat memuat data')
        } finally {
            setIsLoading(false)
            setIsFetchingMore(false)
        }
    }, [])

    useEffect(() => {
        setPage(1)
        setHasMore(true)
        fetchData(1, searchQuery, true)
    }, [searchQuery, fetchData])

    useEffect(() => {
        if (page > 1) fetchData(page, searchQuery, false)
    }, [page, searchQuery, fetchData])

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setSearchQuery(searchTerm)
    }

    const handleClearSearch = () => {
        setSearchTerm('')
        setSearchQuery('')
    }

    const openAddModal = () => {
        setEditingStaff(null)
        setIsModalOpen(true)
    }

    const openEditModal = (s: Staff) => {
        setEditingStaff(s)
        setIsModalOpen(true)
    }

    const openDeleteModal = (s: Staff) => {
        setStaffToDelete(s)
        setIsDeleteModalOpen(true)
    }

    const handleSaveStaff = async (id: string | null, data: { name: string }) => {
        if (id) {
            const res = await updateStaff(id, data)
            if (res.success) {
                toast.success('Staff berhasil diupdate')
                setPage(1)
                fetchData(1, searchQuery, true)
            } else {
                toast.error(res.message || 'Gagal update staff')
                throw new Error('Failed to update')
            }
        } else {
            const res = await createStaff(data)
            if (res.success) {
                toast.success('Staff baru berhasil ditambahkan')
                setPage(1)
                fetchData(1, searchQuery, true)
            } else {
                toast.error(res.message || 'Gagal menambah staff')
                throw new Error('Failed to create')
            }
        }
    }

    const handleDeleteStaff = async () => {
        if (!staffToDelete) return
        try {
            const res = await deleteStaff(staffToDelete.id)
            if (res.success) {
                toast.success('Staff berhasil dihapus')
                setStaffList(prev => prev.filter(s => s.id !== staffToDelete.id))
            } else {
                toast.error(res.message || 'Gagal menghapus staff')
            }
        } catch {
            toast.error('Terjadi kesalahan saat menghapus')
        } finally {
            setIsDeleteModalOpen(false)
            setStaffToDelete(null)
        }
    }

    const handleToggleStatus = async (s: Staff) => {
        try {
            const res = await toggleStaffStatus(s.id)
            if (res.success) {
                setStaffList(prev => prev.map(item => item.id === s.id ? { ...item, is_active: !item.is_active } : item))
                toast.success('Berhasil mengubah status staff')
            } else {
                toast.error(res.message || 'Gagal mengubah status')
            }
        } catch {
            toast.error('Gagal mengubah status staff')
        }
    }

    // Permission guards based on staff.* permissions
    const canCreate = userPermissions.includes('staff.create')
    const canEdit = userPermissions.includes('staff.edit')
    const canDelete = userPermissions.includes('staff.delete')

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden p-6 gap-6 relative" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-violet-500/20 bg-violet-500/10 shadow-[0_0_15px_rgba(139,92,246,0.1)]">
                        <UserCheck className="w-6 h-6 text-violet-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight drop-shadow-sm" style={{ color: 'var(--foreground)' }}>
                            Manajemen Staff
                        </h1>
                        <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                            Kelola data dan status staff
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <form onSubmit={handleSearchSubmit} className="relative w-full md:w-64">
                        <input
                            className="w-full pl-10 pr-10 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                            style={{ background: 'var(--surface-subtle)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                            placeholder="Cari staff..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                                style={{ color: 'var(--muted-foreground)' }}
                            >
                                <XCircle className="w-4 h-4" />
                            </button>
                        )}
                    </form>

                    {canCreate && (
                        <button
                            onClick={openAddModal}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-xl text-sm font-medium transition-all shadow-[0_4px_20px_rgba(139,92,246,0.3)] hover:shadow-[0_4px_25px_rgba(139,92,246,0.5)] transform hover:-translate-y-0.5"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Tambah Staff</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Table Area */}
            <div className="flex-1 overflow-hidden relative z-10 flex flex-col border rounded-2xl shadow-xl" style={{ background: 'var(--card)', borderColor: 'var(--border-subtle)' }}>
                {isLoading && page === 1 ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left whitespace-nowrap">
                            <thead
                                className="sticky top-0 text-xs uppercase font-semibold tracking-wider z-20 border-b shadow-sm"
                                style={{ background: 'var(--surface-overlay)', color: 'var(--muted-foreground)', borderColor: 'var(--border-subtle)' }}
                            >
                                <tr>
                                    <th className="px-6 py-4">Nama Staff</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {staffList.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="py-16 text-center text-gray-500">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                                                    <UserCheck className="w-8 h-8 text-gray-600" />
                                                </div>
                                                <p>Tidak ada data staff ditemukan.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    staffList.map((s, idx) => {
                                        const isLastElement = staffList.length === idx + 1
                                        return (
                                            <motion.tr
                                                ref={isLastElement ? lastRowRef : null}
                                                key={s.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="hover:bg-white/[0.02] transition-colors"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                                                            style={{
                                                                background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(109,40,217,0.2))',
                                                                color: '#a78bfa',
                                                                border: '1px solid rgba(139,92,246,0.2)'
                                                            }}
                                                        >
                                                            {s.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="font-medium" style={{ color: 'var(--foreground)' }}>{s.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {canEdit ? (
                                                        <button
                                                            onClick={() => handleToggleStatus(s)}
                                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                                                s.is_active
                                                                    ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 ring-1 ring-emerald-500/20'
                                                                    : 'bg-red-500/10 text-red-400 hover:bg-red-500/20 ring-1 ring-red-500/20'
                                                            }`}
                                                        >
                                                            {s.is_active ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                                            {s.is_active ? 'Aktif' : 'Nonaktif'}
                                                        </button>
                                                    ) : (
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                                                            s.is_active
                                                                ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20'
                                                                : 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20'
                                                        }`}>
                                                            {s.is_active ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                                            {s.is_active ? 'Aktif' : 'Nonaktif'}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2" style={{ color: 'var(--muted-foreground)' }}>
                                                        {canEdit && (
                                                            <button
                                                                onClick={() => openEditModal(s)}
                                                                className="p-2 rounded-xl transition-all hover:text-violet-400 hover:bg-violet-500/10"
                                                                title="Edit"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        {canDelete && (
                                                            <button
                                                                onClick={() => openDeleteModal(s)}
                                                                className="p-2 rounded-xl transition-all hover:text-red-400 hover:bg-red-500/10"
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
                                        <td colSpan={3} className="py-6 text-center">
                                            <div className="flex items-center justify-center gap-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                                                <div className="w-4 h-4 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
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
            <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] rounded-full pointer-events-none opacity-[0.02] blur-[100px] bg-violet-500" />
            <div className="absolute bottom-[20%] left-[10%] w-[300px] h-[300px] rounded-full pointer-events-none opacity-[0.02] blur-[80px] bg-purple-500" />

            {/* Modals */}
            <StaffModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                staff={editingStaff}
                onSave={handleSaveStaff}
            />

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false)
                    setStaffToDelete(null)
                }}
                onConfirm={handleDeleteStaff}
                itemName={staffToDelete?.name || 'Staff ini'}
            />
        </div>
    )
}
