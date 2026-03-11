import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, User as UserIcon, Mail, Lock, Shield } from 'lucide-react'
import type { User, Role } from '../../services/userService'

function RoleSelect({
    value,
    roles,
    onChange
}: {
    value: string;
    roles: Role[];
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

    const selectedRole = roles.find(r => r.id === value);

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full pl-11 pr-4 py-2.5 bg-black/20 border rounded-xl text-sm flex items-center justify-between cursor-pointer focus:outline-none transition-all duration-200 ${
                    isOpen ? 'border-blue-500/50 ring-2 ring-blue-500/50' : 'border-white/10 hover:border-white/20'
                }`}
                style={{
                    color: value ? 'white' : 'rgb(107 114 128)', // text-white or text-gray-500
                }}
            >
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Shield className="h-5 w-5 text-gray-500" />
                </div>
                <span>{selectedRole?.name || 'Pilih Role'}</span>
                <span className={`text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                </span>
            </div>

            {isOpen && (
                <div className="absolute left-0 right-0 top-[calc(100%+4px)] py-1 rounded-xl z-[60] overflow-hidden shadow-2xl animate-[fadeIn_0.15s_ease-out] bg-[#1a1b23] border border-white/10">
                    <ul className="max-h-60 overflow-y-auto">
                        {roles.map((role) => (
                            <li
                                key={role.id}
                                className="px-4 py-3 text-sm cursor-pointer transition-colors"
                                style={{
                                    color: value === role.id ? '#60a5fa' : 'white', // text-blue-400 or text-white
                                    background: value === role.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
                                }}
                                onClick={() => {
                                    onChange(role.id);
                                    setIsOpen(false);
                                }}
                                onMouseEnter={(e) => {
                                    if (value !== role.id) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                }}
                                onMouseLeave={(e) => {
                                    if (value !== role.id) e.currentTarget.style.background = 'transparent';
                                }}
                            >
                                {role.name}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

interface UserModalProps {
    isOpen: boolean
    onClose: () => void
    user: User | null
    roles: Role[]
    onSave: (id: string | null, data: any) => Promise<void>
}

export function UserModal({ isOpen, onClose, user, roles, onSave }: UserModalProps) {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role_id: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (isOpen) {
            if (user) {
                setFormData({
                    username: user.username || '',
                    email: user.email || '',
                    password: '', // Leave empty for edit
                    role_id: user.role_id || ''
                })
            } else {
                setFormData({
                    username: '',
                    email: '',
                    password: '',
                    role_id: roles.length > 0 ? roles[0].id : ''
                })
            }
        }
    }, [isOpen, user, roles])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        
        try {
            const submitData: any = {
                username: formData.username,
                email: formData.email,
                role_id: formData.role_id
            }

            // Only send password if provided
            if (formData.password) {
                submitData.password = formData.password
            }

            await onSave(user ? user.id : null, submitData)
            onClose()
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen) return null

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
                    className="relative w-full max-w-lg bg-[#1a1b23] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-xl">
                                <UserIcon className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-white">
                                    {user ? 'Edit User' : 'Tambah User Baru'}
                                </h2>
                                <p className="text-sm text-gray-400 mt-1">
                                    {user ? 'Perbarui informasi user' : 'Masukkan detail user baru'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="space-y-4">
                            {/* Username Field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">
                                    Username
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <UserIcon className="h-5 w-5 text-gray-500" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        className="w-full pl-11 pr-4 py-2.5 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                                        placeholder="Masukkan username"
                                    />
                                </div>
                            </div>

                            {/* Email Field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">
                                    Email
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-500" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full pl-11 pr-4 py-2.5 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                                        placeholder="user@example.com"
                                    />
                                </div>
                            </div>

                            {/* Role Select */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">
                                    Role Pengguna
                                </label>
                                <div className="relative">
                                    <RoleSelect
                                        value={formData.role_id}
                                        roles={roles}
                                        onChange={(val) => setFormData({ ...formData, role_id: val })}
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1 flex justify-between">
                                    <span>Password</span>
                                    {user && <span className="text-xs text-gray-500 font-normal">Kosongkan jika tidak diubah</span>}
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-500" />
                                    </div>
                                    <input
                                        type="password"
                                        required={!user}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full pl-11 pr-4 py-2.5 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                                        placeholder={user ? "••••••••" : "Masukkan password (min. 6 karakter)"}
                                        minLength={6}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="px-5 py-2.5 text-sm font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="relative flex items-center justify-center min-w-[120px] px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all disabled:opacity-50 overflow-hidden"
                            >
                                {isSubmitting ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <span>{user ? 'Simpan' : 'Tambah'}</span>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
