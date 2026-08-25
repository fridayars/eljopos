import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, UserCheck, AtSign, Lock, Shield, Eye, EyeOff, User } from 'lucide-react'
import type { Staff, StaffFormData } from '../../services/staffService'
import { getRoles } from '../../services/roleService'
import type { Role } from '../../services/roleService'

interface StaffModalProps {
    isOpen: boolean
    onClose: () => void
    staff: Staff | null
    onSave: (id: string | null, data: StaffFormData) => Promise<void>
}

export function StaffModal({ isOpen, onClose, staff, onSave }: StaffModalProps) {
    const isEditing = !!staff
    const hasUser = isEditing && !!staff?.user

    const [name, setName] = useState('')
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [roleId, setRoleId] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [roles, setRoles] = useState<Role[]>([])
    const [isLoadingRoles, setIsLoadingRoles] = useState(false)

    // On edit: user can optionally fill user fields to register user
    // Track whether user wants to edit user section (for "belum punya user" edit case)
    const [wantsToAddUser, setWantsToAddUser] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setName(staff?.name || '')
            setUsername(staff?.user?.username || '')
            setEmail(staff?.user?.email || '')
            setRoleId(staff?.user?.role_id || '')
            setPassword('')
            setShowPassword(false)
            setWantsToAddUser(false)
            loadRoles()
        }
    }, [isOpen, staff])

    const loadRoles = async () => {
        setIsLoadingRoles(true)
        try {
            const res = await getRoles({ page: 1, limit: 100 })
            if (res.success) setRoles(res.data.items)
        } finally {
            setIsLoadingRoles(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return

        const payload: StaffFormData = { name: name.trim() }

        // Include user fields only if relevant
        const shouldIncludeUser = !isEditing || hasUser || wantsToAddUser
        if (shouldIncludeUser) {
            if (username.trim()) payload.username = username.trim()
            if (email.trim()) payload.email = email.trim()
            if (password) payload.password = password
            if (roleId) payload.role_id = roleId
        }

        setIsSubmitting(true)
        try {
            await onSave(staff ? staff.id : null, payload)
            onClose()
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen) return null

    const showUserSection = !isEditing || hasUser || wantsToAddUser

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-lg border rounded-2xl shadow-2xl overflow-hidden"
                    style={{ background: 'var(--surface-modal)', borderColor: 'var(--border)' }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-violet-500/10 rounded-xl">
                                <UserCheck className="w-5 h-5 text-violet-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
                                    {isEditing ? 'Edit Staff' : 'Tambah Staff Baru'}
                                </h2>
                                <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                                    {isEditing
                                        ? hasUser
                                            ? 'Perbarui info staff & akun user'
                                            : 'Perbarui info staff'
                                        : 'Data staff & akun login (opsional)'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl transition-colors"
                            style={{ color: 'var(--muted-foreground)', background: 'var(--surface-subtle)' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--foreground)'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted-foreground)'}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">

                        {/* ─── Staff Info Section ─── */}
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--muted-foreground)' }}>
                                Informasi Staff
                            </p>
                            <label className="block text-sm font-medium mb-1.5 ml-1" style={{ color: 'var(--foreground)' }}>
                                Nama Staff <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <User className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
                                </div>
                                <input
                                    type="text"
                                    required
                                    autoFocus
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-200"
                                    style={{ background: 'var(--input-background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                                    placeholder="Contoh: Budi Santoso"
                                />
                            </div>
                        </div>

                        {/* ─── Divider + User Section toggle (edit, no user) ─── */}
                        {isEditing && !hasUser && !wantsToAddUser && (
                            <div className="flex items-center gap-3 py-2">
                                <div className="flex-1 h-px" style={{ background: 'var(--border-subtle)' }} />
                                <button
                                    type="button"
                                    onClick={() => setWantsToAddUser(true)}
                                    className="flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-xl border transition-all hover:bg-violet-500/10 hover:text-violet-400 hover:border-violet-500/40"
                                    style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
                                >
                                    <Shield className="w-3.5 h-3.5" />
                                    Daftarkan Akun User
                                </button>
                                <div className="flex-1 h-px" style={{ background: 'var(--border-subtle)' }} />
                            </div>
                        )}

                        {/* ─── User Account Section ─── */}
                        {showUserSection && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-px" style={{ background: 'var(--border-subtle)' }} />
                                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                                        style={{ background: 'var(--violet-900, rgba(139,92,246,0.1))', color: '#a78bfa' }}>
                                        <Shield className="w-3 h-3" />
                                        {hasUser ? 'Akun User' : 'Daftarkan Akun User'}
                                    </div>
                                    <div className="flex-1 h-px" style={{ background: 'var(--border-subtle)' }} />
                                </div>

                                {!hasUser && !isEditing && (
                                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                        Opsional — isi jika ingin staff ini dapat login ke sistem
                                    </p>
                                )}

                                {/* Username */}
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 ml-1" style={{ color: 'var(--foreground)' }}>
                                        Username {!hasUser && !isEditing ? '' : <span className="text-red-500">*</span>}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <User className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
                                        </div>
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            required={hasUser || wantsToAddUser}
                                            className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-200"
                                            style={{ background: 'var(--input-background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                                            placeholder="Contoh: budi.santoso"
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 ml-1" style={{ color: 'var(--foreground)' }}>
                                        Email {!hasUser && !isEditing ? '' : <span className="text-red-500">*</span>}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <AtSign className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
                                        </div>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required={hasUser || wantsToAddUser}
                                            className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-200"
                                            style={{ background: 'var(--input-background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                                            placeholder="budi@email.com"
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 ml-1" style={{ color: 'var(--foreground)' }}>
                                        Password {isEditing && hasUser
                                            ? <span className="text-xs font-normal" style={{ color: 'var(--muted-foreground)' }}>(kosongkan jika tidak diubah)</span>
                                            : !isEditing ? '' : <span className="text-red-500">*</span>}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <Lock className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
                                        </div>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required={wantsToAddUser || (!isEditing && !!(username || email || roleId))}
                                            minLength={6}
                                            className="w-full pl-10 pr-11 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-200"
                                            style={{ background: 'var(--input-background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                                            placeholder={isEditing && hasUser ? '••••••••' : 'Min. 6 karakter'}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(v => !v)}
                                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center"
                                            style={{ color: 'var(--muted-foreground)' }}
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Role */}
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 ml-1" style={{ color: 'var(--foreground)' }}>
                                        Role / Jabatan {!hasUser && !isEditing ? '' : <span className="text-red-500">*</span>}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <Shield className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
                                        </div>
                                        {isLoadingRoles ? (
                                            <div className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm flex items-center gap-2"
                                                style={{ background: 'var(--input-background)', borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
                                                <div className="w-3 h-3 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                                                Memuat roles...
                                            </div>
                                        ) : (
                                            <select
                                                value={roleId}
                                                onChange={(e) => setRoleId(e.target.value)}
                                                required={hasUser || wantsToAddUser}
                                                className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-200 appearance-none"
                                                style={{ background: 'var(--input-background)', borderColor: 'var(--border)', color: roleId ? 'var(--foreground)' : 'var(--muted-foreground)' }}
                                            >
                                                <option value="">Pilih role...</option>
                                                {roles.map(r => (
                                                    <option key={r.id} value={r.id}>{r.name}</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                </div>

                                {/* Cancel adding user (edit mode only) */}
                                {isEditing && !hasUser && wantsToAddUser && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setWantsToAddUser(false)
                                            setUsername('')
                                            setEmail('')
                                            setPassword('')
                                            setRoleId('')
                                        }}
                                        className="text-xs underline"
                                        style={{ color: 'var(--muted-foreground)' }}
                                    >
                                        Batalkan pendaftaran user
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Footer */}
                        <div className="flex justify-end gap-3 pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="px-5 py-2.5 text-sm font-medium rounded-xl transition-all disabled:opacity-50"
                                style={{ color: 'var(--muted-foreground)', background: 'var(--surface-subtle)' }}
                                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--foreground)'}
                                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted-foreground)'}
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || !name.trim()}
                                className="relative flex items-center justify-center min-w-[120px] px-5 py-2.5 text-sm font-medium text-white bg-violet-600 rounded-xl hover:bg-violet-700 transition-all disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <span>{isEditing ? 'Simpan' : 'Tambah'}</span>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
