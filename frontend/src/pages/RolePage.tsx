import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Edit, Trash2, ShieldCheck, ArrowLeft, ArrowRight, CheckCircle2, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'motion/react'
import { getRoles, createRole, updateRole, toggleRoleStatus, deleteRole, getRoleById } from '../services/roleService'
import type { Role } from '../services/roleService'
import { RoleModal } from '../components/roles/RoleModal'
import { DeleteConfirmationModal } from '../components/inventory/DeleteConfirmationModal'

export function RolePage() {
    // Data States
    const [roles, setRoles] = useState<Role[]>([])
    const [isLoading, setIsLoading] = useState(true)

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
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchTerm, setSearchTerm] = useState('') // Separate for input display
    const limit = 10

    // Modal States
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
    const [editingRole, setEditingRole] = useState<Role | null>(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [roleToDelete, setRoleToDelete] = useState<Role | null>(null)

    const fetchInitialData = useCallback(async () => {
        setIsLoading(true)
        try {
            const rolesRes = await getRoles({ page: currentPage, limit, search: searchQuery })

            if (rolesRes.success) {
                setRoles(rolesRes.data.items)
                setTotalPages(rolesRes.data.total_pages)
            } else {
                toast.error(rolesRes.message || 'Gagal memuat role')
            }
        } catch {
            toast.error('Terjadi kesalahan saat memuat data')
        } finally {
            setIsLoading(false)
        }
    }, [currentPage, searchQuery])

    // Load initial data
    useEffect(() => {
        fetchInitialData()
    }, [fetchInitialData])

    // Handle Search Submit
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setSearchQuery(searchTerm)
        setCurrentPage(1)
    }

    const handleClearSearch = () => {
        setSearchTerm('')
        setSearchQuery('')
        setCurrentPage(1)
    }

    // Modal Handlers
    const openAddRole = () => {
        setEditingRole(null)
        setIsRoleModalOpen(true)
    }

    const openEditRole = async (role: Role) => {
        try {
            // Fetch detailed active role to get permissions
            const res = await getRoleById(role.id)
            if (res.success) {
                setEditingRole(res.data)
                setIsRoleModalOpen(true)
            } else {
                toast.error(res.message || 'Gagal mengambil detail role')
            }
        } catch {
            toast.error('Gagal mengambil detail role')
        }
    }

    const openDeleteRole = (role: Role) => {
        setRoleToDelete(role)
        setIsDeleteModalOpen(true)
    }

    // CRUD Operations
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSaveRole = async (id: string | null, data: any) => {
        if (id) {
            const res = await updateRole(id, data)
            if (res.success) {
                toast.success('Role berhasil diupdate')
                fetchInitialData()
            } else {
                toast.error(res.message || 'Gagal update role')
                throw new Error('Failed to update')
            }
        } else {
            const res = await createRole(data)
            if (res.success) {
                toast.success('Role baru berhasil ditambahkan')
                fetchInitialData()
            } else {
                toast.error(res.message || 'Gagal menambah role')
                throw new Error('Failed to create')
            }
        }
    }

    const handleDeleteRole = async () => {
        if (!roleToDelete) return
        
        try {
            const res = await deleteRole(roleToDelete.id)
            if (res.success) {
                toast.success('Role berhasil dihapus')
                fetchInitialData()
            } else {
                toast.error(res.message || 'Gagal menghapus role')
            }
        } catch {
            toast.error('Terjadi kesalahan saat menghapus')
        } finally {
            setIsDeleteModalOpen(false)
            setRoleToDelete(null)
        }
    }

    const handleToggleStatus = async (role: Role) => {
        try {
            const res = await toggleRoleStatus(role.id)
            if (res.success) {
                setRoles(roles.map(r => 
                    r.id === role.id ? { ...r, is_active: !r.is_active } : r
                ))
                toast.success(`Berhasil mengubah status role`)
            } else {
                toast.error(res.message || 'Gagal mengubah status')
            }
        } catch {
            toast.error('Gagal mengubah status role')
        }
    }

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden p-6 gap-6 relative" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
             {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-purple-500/20 bg-purple-500/10 shadow-[0_0_15px_rgba(139,92,246,0.1)]">
                        <ShieldCheck className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight drop-shadow-sm" style={{ color: 'var(--foreground)' }}>Kelola Role</h1>
                        <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                            Atur izin dan hak akses untuk tiap role sistem
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <form onSubmit={handleSearchSubmit} className="relative w-full md:w-64">
                        <input
                            className="w-full pl-10 pr-10 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                            style={{ background: 'var(--surface-subtle)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                            placeholder="Cari role..."
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

                    {userPermissions.includes('role.create') && (
                        <button
                            onClick={openAddRole}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-sm font-medium transition-all shadow-[0_4px_20px_rgba(139,92,246,0.3)] hover:shadow-[0_4px_25px_rgba(139,92,246,0.5)] transform hover:-translate-y-0.5"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Tambah Role</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Table Area */}
            <div className="flex-1 overflow-hidden relative z-10 flex flex-col border rounded-2xl shadow-xl" style={{ background: 'var(--card)', borderColor: 'var(--border-subtle)' }}>
                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-left whitespace-nowrap">
                                <thead className="sticky top-0 text-xs uppercase font-semibold tracking-wider z-20 border-b shadow-sm" style={{ background: 'var(--surface-overlay)', color: 'var(--muted-foreground)', borderColor: 'var(--border-subtle)' }}>
                                    <tr>
                                        <th className="px-6 py-4">Nama Role</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                        <th className="px-6 py-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {roles.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="py-16 text-center text-gray-500">
                                                <div className="flex flex-col items-center justify-center gap-3">
                                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                                                        <Search className="w-8 h-8 text-gray-600" />
                                                    </div>
                                                    <p>Tidak ada data role ditemukan.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        roles.map((role, idx) => (
                                            <motion.tr 
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                key={role.id} 
                                                className="hover:bg-white/[0.02] transition-colors"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="font-medium" style={{ color: 'var(--foreground)' }}>{role.name}</div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {userPermissions.includes('role.edit') ? (
                                                        <button 
                                                            onClick={() => handleToggleStatus(role)}
                                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                                                role.is_active 
                                                                ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 ring-1 ring-emerald-500/20' 
                                                                : 'bg-red-500/10 text-red-400 hover:bg-red-500/20 ring-1 ring-red-500/20'
                                                            }`}
                                                        >
                                                            {role.is_active ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                                            {role.is_active ? 'Aktif' : 'Nonaktif'}
                                                        </button>
                                                    ) : (
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                                                            role.is_active 
                                                            ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20' 
                                                            : 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20'
                                                        }`}>
                                                            {role.is_active ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                                            {role.is_active ? 'Aktif' : 'Nonaktif'}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2" style={{ color: 'var(--muted-foreground)' }}>
                                                        {userPermissions.includes('role.edit') && (
                                                            <button 
                                                                onClick={() => openEditRole(role)}
                                                                className="p-2 rounded-xl transition-all" style={{ background: 'var(--surface-subtle)' }}
                                                                title="Edit"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        {userPermissions.includes('role.delete') && (
                                                            <button 
                                                                onClick={() => openDeleteRole(role)}
                                                                className="p-2 rounded-xl transition-all" style={{ background: 'var(--surface-subtle)' }}
                                                                title="Hapus"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Footer */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between p-4 border-t mt-auto" style={{ background: 'var(--surface-overlay)', borderColor: 'var(--border-subtle)' }}>
                                <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                                    Halaman <span className="font-medium" style={{ color: 'var(--foreground)' }}>{currentPage}</span> dari <span className="font-medium" style={{ color: 'var(--foreground)' }}>{totalPages}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        className="p-2 border rounded-xl transition-all disabled:opacity-50" style={{ background: 'var(--surface-subtle)', borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        className="p-2 border rounded-xl transition-all disabled:opacity-50" style={{ background: 'var(--surface-subtle)', borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
                                    >
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Decorative Background */}
            <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] rounded-full pointer-events-none opacity-[0.02] blur-[100px] bg-purple-500" />
            <div className="absolute bottom-[20%] left-[10%] w-[300px] h-[300px] rounded-full pointer-events-none opacity-[0.02] blur-[80px] bg-indigo-500" />

            {/* Modals */}
            <RoleModal 
                isOpen={isRoleModalOpen}
                onClose={() => setIsRoleModalOpen(false)}
                role={editingRole}
                onSave={handleSaveRole}
            />

            <DeleteConfirmationModal 
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false)
                    setRoleToDelete(null)
                }}
                onConfirm={handleDeleteRole}
                itemName={roleToDelete?.name || 'Role ini'}
            />
        </div>
    )
}
