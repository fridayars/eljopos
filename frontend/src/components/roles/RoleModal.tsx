import { useState, useEffect } from 'react'
import { X, ShieldCheck, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import type { Role } from '../../services/roleService'

interface RoleModalProps {
    isOpen: boolean
    onClose: () => void
    role: Role | null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSave: (id: string | null, data: any) => Promise<void>
}

// Master Permissions
const PERMISSION_GROUPS = [
    {
        label: 'Kasir',
        items: [
            { value: 'casier', label: 'Akses Kasir' },
            { value: 'casier.changedate', label: 'Ubah Tanggal' },
        ]
    },
    {
        label: 'Produk',
        items: [
            { value: 'product.view', label: 'Lihat' },
            { value: 'product.create', label: 'Tambah' },
            { value: 'product.edit', label: 'Edit' },
            { value: 'product.delete', label: 'Hapus' },
            { value: 'product.transfer', label: 'Transfer Stok' },
            { value: 'product.import', label: 'Import' },
            { value: 'product.export', label: 'Export' },
        ]
    },
    {
        label: 'User',
        items: [
            { value: 'user.view', label: 'Lihat' },
            { value: 'user.create', label: 'Tambah' },
            { value: 'user.edit', label: 'Edit' },
            { value: 'user.delete', label: 'Hapus' },
        ]
    },
    {
        label: 'Role',
        items: [
            { value: 'role.view', label: 'Lihat' },
            { value: 'role.create', label: 'Tambah' },
            { value: 'role.edit', label: 'Edit' },
            { value: 'role.delete', label: 'Hapus' },
        ]
    },
    {
        label: 'Layanan',
        items: [
            { value: 'service.view', label: 'Lihat' },
            { value: 'service.create', label: 'Tambah' },
            { value: 'service.edit', label: 'Edit' },
            { value: 'service.delete', label: 'Hapus' },
            { value: 'service.import', label: 'Import' },
            { value: 'service.export', label: 'Export' },
        ]
    },
    {
        label: 'Laporan',
        items: [
            { value: 'report.general', label: 'Ringkasan Umum' },
            { value: 'report.finance', label: 'Keuangan' },
            { value: 'report.transaction', label: 'Riwayat Transaksi' },
            { value: 'report.deletetransaction', label: 'Hapus Transaksi' },
        ]
    }
]

export function RoleModal({ isOpen, onClose, role, onSave }: RoleModalProps) {
    const [name, setName] = useState('')
    const [permissions, setPermissions] = useState<string[]>([])
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (isOpen) {
            if (role) {
                setName(role.name)
                // Extract permission strings from AksesRole objects
                const perms = role.permissions?.map(p => p.permission) || []
                setPermissions(perms)
            } else {
                setName('')
                setPermissions([])
            }
        }
    }, [isOpen, role])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return

        setIsSaving(true)
        try {
            const data = {
                name,
                permissions
            }
            await onSave(role ? role.id : null, data)
            onClose()
        } catch {
            // Error handled by parent
        } finally {
            setIsSaving(false)
        }
    }

    const togglePermission = (value: string) => {
        setPermissions(prev => 
            prev.includes(value) 
                ? prev.filter(p => p !== value)
                : [...prev, value]
        )
    }

    const toggleGroup = (groupItems: {value: string, label: string}[]) => {
        const groupValues = groupItems.map(item => item.value)
        const allSelected = groupValues.length > 0 && groupValues.every(val => permissions.includes(val))
        
        if (allSelected) {
            // Remove all
            setPermissions(prev => prev.filter(p => !groupValues.includes(p)))
        } else {
            // Add all missing
            setPermissions(prev => {
                const newPerms = [...prev]
                groupValues.forEach(val => {
                    if (!newPerms.includes(val)) newPerms.push(val)
                })
                return newPerms
            })
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
                    className="relative w-full max-w-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" style={{ background: 'var(--surface-modal)' }}
                >
                    <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                                <ShieldCheck className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">
                                    {role ? 'Edit Role' : 'Tambah Role Baru'}
                                </h2>
                                <p className="text-sm text-gray-400">
                                    {role ? 'Ubah informasi dan hak akses role.' : 'Pilih hak akses untuk role baru.'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="overflow-y-auto p-6 custom-scrollbar">
                        <form id="roleForm" onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Nama Role <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50" style={{ background: 'var(--surface-subtle)', color: 'var(--foreground)' }}
                                    placeholder="Contoh: Manager"
                                />
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-300 mb-1">Hak Akses</h3>
                                    <p className="text-xs text-gray-500 mb-4">Pilih modul yang dapat diakses oleh role ini.</p>
                                </div>

                                <div className="space-y-4">
                                    {PERMISSION_GROUPS.map((group, idx) => {
                                        const groupValues = group.items.map(item => item.value)
                                        const allSelected = groupValues.length > 0 && groupValues.every(val => permissions.includes(val))

                                        return (
                                            <div key={idx} className="border border-white/10 rounded-xl p-4" style={{ background: 'var(--surface-subtle)' }}>
                                                <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/5">
                                                    <div className="font-medium text-purple-200">{group.label}</div>
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleGroup(group.items)}
                                                        className="text-xs text-purple-400 hover:text-purple-300 transition-colors bg-purple-500/10 hover:bg-purple-500/20 px-2 py-1 rounded"
                                                    >
                                                        {allSelected ? 'Batalkan Semua' : 'Pilih Semua'}
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                    {group.items.map((item, itemIdx) => {
                                                        const isSelected = permissions.includes(item.value)
                                                        return (
                                                            <div 
                                                                key={itemIdx} 
                                                                onClick={() => togglePermission(item.value)}
                                                                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors border ${isSelected ? 'bg-purple-500/10 border-purple-500/30' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                                                            >
                                                                <div className={`w-4 h-4 rounded mt-0.5 flex-shrink-0 flex items-center justify-center border transition-colors ${isSelected ? 'bg-purple-500 border-purple-500 text-white' : 'border-gray-500 bg-transparent'}`}>
                                                                    {isSelected && <Check className="w-3 h-3" />}
                                                                </div>
                                                                <span className={`text-sm select-none ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                                                                    {item.label}
                                                                </span>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="p-6 border-t border-white/5 bg-white/[0.02] flex items-center justify-end gap-3 mt-auto">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium border border-white/10 rounded-xl transition-all" style={{ color: 'var(--muted-foreground)', background: 'var(--surface-subtle)' }}
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            form="roleForm"
                            disabled={isSaving || !name.trim()}
                            className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(139,92,246,0.3)] hover:shadow-[0_4px_25px_rgba(139,92,246,0.4)]"
                        >
                            {isSaving ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
