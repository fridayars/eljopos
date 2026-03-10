import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Edit, Trash2, Users, ShieldAlert, ArrowLeft, ArrowRight, CheckCircle2, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'motion/react'
import { getUsers, createUser, updateUser, toggleUserStatus, deleteUser, getRoles } from '../services/userService'
import type { User, Role } from '../services/userService'
import { UserModal } from '../components/users/UserModal'
import { DeleteConfirmationModal } from '../components/inventory/DeleteConfirmationModal'

export function UsersPage() {
    // Data States
    const [users, setUsers] = useState<User[]>([])
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
    const [isUserModalOpen, setIsUserModalOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<User | null>(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [userToDelete, setUserToDelete] = useState<User | null>(null)

    const fetchInitialData = useCallback(async () => {
        setIsLoading(true)
        try {
            const [usersRes, rolesRes] = await Promise.all([
                getUsers({ page: currentPage, limit, search: searchQuery }),
                getRoles()
            ])

            if (usersRes.success) {
                setUsers(usersRes.data.items)
                setTotalPages(usersRes.data.total_pages)
            } else {
                toast.error(usersRes.message || 'Gagal memuat pengguna')
            }

            if (rolesRes.success) {
                setRoles(rolesRes.data)
            } else {
                toast.error(rolesRes.message || 'Gagal memuat role')
            }
        } catch (error) {
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
    const openAddUser = () => {
        setEditingUser(null)
        setIsUserModalOpen(true)
    }

    const openEditUser = (user: User) => {
        setEditingUser(user)
        setIsUserModalOpen(true)
    }

    const openDeleteUser = (user: User) => {
        setUserToDelete(user)
        setIsDeleteModalOpen(true)
    }

    // CRUD Operations
    const handleSaveUser = async (id: string | null, data: any) => {
        if (id) {
            const res = await updateUser(id, data)
            if (res.success) {
                toast.success('User berhasil diupdate')
                fetchInitialData()
            } else {
                toast.error(res.message || 'Gagal update user')
                throw new Error('Failed to update')
            }
        } else {
            const res = await createUser(data)
            if (res.success) {
                toast.success('User baru berhasil ditambahkan')
                fetchInitialData()
            } else {
                toast.error(res.message || 'Gagal menambah user')
                throw new Error('Failed to create')
            }
        }
    }

    const handleDeleteUser = async () => {
        if (!userToDelete) return
        
        try {
            const res = await deleteUser(userToDelete.id)
            if (res.success) {
                toast.success('User berhasil dihapus')
                fetchInitialData()
            } else {
                toast.error(res.message || 'Gagal menghapus user')
            }
        } catch (error) {
            toast.error('Terjadi kesalahan saat menghapus')
        } finally {
            setIsDeleteModalOpen(false)
            setUserToDelete(null)
        }
    }

    const handleToggleStatus = async (user: User) => {
        try {
            const res = await toggleUserStatus(user.id)
            if (res.success) {
                setUsers(users.map(u => 
                    u.id === user.id ? { ...u, is_active: !u.is_active } : u
                ))
                toast.success(`Berhasil mengubah status user`)
            } else {
                toast.error(res.message || 'Gagal mengubah status')
            }
        } catch (error) {
            toast.error('Gagal mengubah status user')
        }
    }

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden p-6 gap-6 relative bg-[#0a0a0f] text-gray-200">
             {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-indigo-500/20 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                        <Users className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-sm">Manajemen User</h1>
                        <p className="text-sm text-indigo-200/60 mt-0.5">
                            Kelola akses pengguna dan pengaturan role sistem
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <form onSubmit={handleSearchSubmit} className="relative w-full md:w-64">
                        <input
                            type="text"
                            placeholder="Cari user (nama/email)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-10 py-2.5 bg-[#14151a] border border-white/5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder-gray-500"
                        />
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                            >
                                <XCircle className="w-4 h-4" />
                            </button>
                        )}
                    </form>

                    {userPermissions.includes('user.create') && (
                        <button
                            onClick={openAddUser}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-sm font-medium transition-all shadow-[0_4px_20px_rgba(99,102,241,0.3)] hover:shadow-[0_4px_25px_rgba(99,102,241,0.5)] transform hover:-translate-y-0.5"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Tambah User</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Table Area */}
            <div className="flex-1 overflow-hidden relative z-10 flex flex-col bg-[#111218] border border-white/5 rounded-2xl shadow-xl">
                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-left whitespace-nowrap">
                                <thead className="sticky top-0 bg-[#161722] text-xs uppercase text-gray-400 font-semibold tracking-wider z-20 border-b border-white/5 shadow-sm">
                                    <tr>
                                        <th className="px-6 py-4">User</th>
                                        <th className="px-6 py-4">Email</th>
                                        <th className="px-6 py-4">Role</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                        <th className="px-6 py-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {users.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-16 text-center text-gray-500">
                                                <div className="flex flex-col items-center justify-center gap-3">
                                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                                                        <Search className="w-8 h-8 text-gray-600" />
                                                    </div>
                                                    <p>Tidak ada data user ditemukan.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        users.map((user, idx) => (
                                            <motion.tr 
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                key={user.id} 
                                                className="hover:bg-white/[0.02] transition-colors"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-200">{user.username}</div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-400">
                                                    {user.email}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                                        <ShieldAlert className="w-3.5 h-3.5" />
                                                        {user.role?.name || 'Unknown'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {userPermissions.includes('user.edit') ? (
                                                        <button 
                                                            onClick={() => handleToggleStatus(user)}
                                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                                                user.is_active 
                                                                ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 ring-1 ring-emerald-500/20' 
                                                                : 'bg-red-500/10 text-red-400 hover:bg-red-500/20 ring-1 ring-red-500/20'
                                                            }`}
                                                        >
                                                            {user.is_active ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                                            {user.is_active ? 'Aktif' : 'Nonaktif'}
                                                        </button>
                                                    ) : (
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                                                            user.is_active 
                                                            ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20' 
                                                            : 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20'
                                                        }`}>
                                                            {user.is_active ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                                            {user.is_active ? 'Aktif' : 'Nonaktif'}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2 text-gray-400">
                                                        {userPermissions.includes('user.edit') && (
                                                            <button 
                                                                onClick={() => openEditUser(user)}
                                                                className="p-2 bg-white/5 hover:bg-blue-500/20 hover:text-blue-400 rounded-xl transition-all"
                                                                title="Edit"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        {userPermissions.includes('user.delete') && (
                                                            <button 
                                                                onClick={() => openDeleteUser(user)}
                                                                className="p-2 bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 rounded-xl transition-all"
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
                            <div className="flex items-center justify-between p-4 border-t border-white/5 bg-[#161722] mt-auto">
                                <div className="text-sm text-gray-500">
                                    Halaman <span className="text-white font-medium">{currentPage}</span> dari <span className="text-white font-medium">{totalPages}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        className="p-2 bg-[#1a1b23] border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-50 transition-all"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        className="p-2 bg-[#1a1b23] border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-50 transition-all"
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
            <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] rounded-full pointer-events-none opacity-[0.02] blur-[100px] bg-indigo-500" />
            <div className="absolute bottom-[20%] left-[10%] w-[300px] h-[300px] rounded-full pointer-events-none opacity-[0.02] blur-[80px] bg-purple-500" />

            {/* Modals */}
            <UserModal 
                isOpen={isUserModalOpen}
                onClose={() => setIsUserModalOpen(false)}
                user={editingUser}
                roles={roles}
                onSave={handleSaveUser}
            />

            <DeleteConfirmationModal 
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false)
                    setUserToDelete(null)
                }}
                onConfirm={handleDeleteUser}
                itemName={userToDelete?.username || 'User ini'}
            />
        </div>
    )
}
