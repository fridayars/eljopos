import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Upload, Loader2, Plus, Image as ImageIcon, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { submitKlaimGaransi } from '../../services/garansiService'
import { getSuppliers, createSupplier } from '../../services/supplierService'
import type { Supplier } from '../../services/supplierService'
import { getTipeHp, createTipeHp } from '../../services/tipeHpService'
import type { TipeHp } from '../../services/tipeHpService'
import { CustomSelect } from '../ui/CustomSelect'

interface KlaimGaransiModalProps {
    isOpen: boolean
    onClose: () => void
    transaksiDetailId: string
    itemName: string
    onSuccess: (data?: any) => void
}

export function KlaimGaransiModal({ isOpen, onClose, transaksiDetailId, itemName, onSuccess }: KlaimGaransiModalProps) {
    const [tindakan, setTindakan] = useState<'ganti_sparepart' | 'tanpa_ganti_sparepart'>('ganti_sparepart')
    const [kendala, setKendala] = useState('')
    const [detailTindakan, setDetailTindakan] = useState('')
    const [supplierId, setSupplierId] = useState('')
    const [tipeHpId, setTipeHpId] = useState('')
    const [merk, setMerk] = useState('')
    const [tanggalKlaim, setTanggalKlaim] = useState(() => {
        const today = new Date()
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    })
    
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

    // File uploads
    const [files, setFiles] = useState<File[]>([])
    
    // Supplier data
    const [suppliers, setSuppliers] = useState<Supplier[]>([])
    const [isCreatingSupplier, setIsCreatingSupplier] = useState(false)
    const [newSupplierName, setNewSupplierName] = useState('')

    // Tipe HP data
    const [tipeHps, setTipeHps] = useState<TipeHp[]>([])
    const [isCreatingTipeHp, setIsCreatingTipeHp] = useState(false)
    const [newTipeHpName, setNewTipeHpName] = useState('')

    const [isSubmitting, setIsSubmitting] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (isOpen) {
            fetchSuppliers()
            fetchTipeHps()
            // Reset form
            setTindakan('ganti_sparepart')
            setKendala('')
            setDetailTindakan('')
            setSupplierId('')
            setTipeHpId('')
            setMerk('')
            setFiles([])
            setIsCreatingSupplier(false)
            setNewSupplierName('')
            setIsCreatingTipeHp(false)
            setNewTipeHpName('')
            
            const now = new Date()
            setTanggalKlaim(new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 10))
        }
    }, [isOpen])

    const fetchSuppliers = async () => {
        try {
            const res = await getSuppliers()
            if (res.success) {
                setSuppliers(res.data)
            }
        } catch (error) {
            console.error('Failed to fetch suppliers')
        }
    }

    const handleCreateSupplier = async () => {
        if (!newSupplierName.trim()) return
        try {
            const res = await createSupplier({ name: newSupplierName.trim() })
            if (res.success) {
                toast.success('Supplier berhasil ditambahkan')
                setSuppliers(prev => [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)))
                setSupplierId(res.data.id)
                setIsCreatingSupplier(false)
                setNewSupplierName('')
            }
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    const fetchTipeHps = async () => {
        try {
            const res = await getTipeHp()
            if (res.success) {
                setTipeHps(res.data)
            }
        } catch (error) {
            console.error('Failed to fetch tipe hp')
        }
    }

    const handleCreateTipeHp = async () => {
        if (!newTipeHpName.trim()) return
        try {
            const res = await createTipeHp({ name: newTipeHpName.trim() })
            if (res.success) {
                toast.success('Tipe HP berhasil ditambahkan')
                setTipeHps(prev => [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)))
                setTipeHpId(res.data.id)
                setIsCreatingTipeHp(false)
                setNewTipeHpName('')
            }
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files)
            if (files.length + newFiles.length > 5) {
                toast.error('Maksimal 5 foto bukti')
                return
            }
            setFiles(prev => [...prev, ...newFiles])
        }
    }

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!kendala.trim()) {
            toast.error('Kendala harus diisi')
            return
        }
        if (!detailTindakan.trim()) {
            toast.error('Detail tindakan harus diisi')
            return
        }
        if (!supplierId) {
            toast.error('Supplier harus dipilih')
            return
        }
        if (!tipeHpId) {
            toast.error('Tipe HP harus dipilih')
            return
        }
        if (!merk.trim()) {
            toast.error('Merk harus diisi')
            return
        }
        if (files.length === 0) {
            toast.error('Minimal 1 foto bukti harus diunggah')
            return
        }
        
        setIsSubmitting(true)
        try {
            const res = await submitKlaimGaransi(transaksiDetailId, {
                tindakan,
                kendala,
                detail_tindakan: detailTindakan,
                supplier_id: supplierId,
                tipe_hp_id: tipeHpId,
                merk,
                tanggal_klaim: tanggalKlaim // Send YYYY-MM-DD directly
            }, files)
            
            if (res.success) {
                toast.success('Klaim garansi berhasil disimpan')
                onSuccess(res.data)
                onClose()
            }
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    />
                    <motion.div
                        initial={{ scale: 0.95, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-white/10"
                        style={{ background: 'var(--background)' }}
                    >
                        <div className="p-5 border-b border-white/5 flex items-center justify-between" style={{ background: 'var(--surface-overlay)' }}>
                            <div>
                                <h2 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>Klaim Garansi</h2>
                                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{itemName}</p>
                            </div>
                            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto flex-1">
                            <form id="klaimForm" onSubmit={handleSubmit} className="space-y-5">

                                <div>
                                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>Tanggal Klaim</label>
                                    <input
                                        type="date"
                                        required
                                        value={tanggalKlaim}
                                        onChange={e => setTanggalKlaim(e.target.value)}
                                        disabled={!userPermissions.includes('customer.claim_warranty_changedate')}
                                        className="w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{ background: 'var(--input-background, var(--surface-subtle))', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>Tindakan</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input 
                                                type="radio" 
                                                name="tindakan" 
                                                value="ganti_sparepart" 
                                                checked={tindakan === 'ganti_sparepart'} 
                                                onChange={() => setTindakan('ganti_sparepart')}
                                                className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                            />
                                            <span className="text-sm" style={{ color: 'var(--foreground)' }}>Ganti Sparepart (Stok Berkurang)</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input 
                                                type="radio" 
                                                name="tindakan" 
                                                value="tanpa_ganti_sparepart" 
                                                checked={tindakan === 'tanpa_ganti_sparepart'} 
                                                onChange={() => setTindakan('tanpa_ganti_sparepart')}
                                                className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                            />
                                            <span className="text-sm" style={{ color: 'var(--foreground)' }}>Tanpa Ganti Sparepart</span>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>Kendala</label>
                                    <textarea
                                        required
                                        rows={3}
                                        value={kendala}
                                        onChange={e => setKendala(e.target.value)}
                                        className="w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                        style={{ background: 'var(--surface-subtle)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                                        placeholder="Jelaskan kendala atau alasan klaim garansi..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>Detail Tindakan</label>
                                    <textarea
                                        required
                                        rows={2}
                                        value={detailTindakan}
                                        onChange={e => setDetailTindakan(e.target.value)}
                                        className="w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                        style={{ background: 'var(--surface-subtle)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                                        placeholder="Jelaskan detail tindakan perbaikan yang dilakukan..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5 flex justify-between" style={{ color: 'var(--foreground)' }}>
                                            <span>Supplier</span>
                                            {!isCreatingSupplier && (
                                                <button type="button" onClick={() => setIsCreatingSupplier(true)} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                                                    <Plus className="w-3 h-3" /> Baru
                                                </button>
                                            )}
                                        </label>
                                        
                                        {isCreatingSupplier ? (
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={newSupplierName}
                                                    onChange={e => setNewSupplierName(e.target.value)}
                                                    className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                                    style={{ background: 'var(--surface-subtle)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                                                    placeholder="Nama supplier..."
                                                    autoFocus
                                                />
                                                <button 
                                                    type="button" 
                                                    onClick={handleCreateSupplier}
                                                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium whitespace-nowrap transition-colors"
                                                >
                                                    Simpan
                                                </button>
                                                <button 
                                                    type="button" 
                                                    onClick={() => setIsCreatingSupplier(false)}
                                                    className="p-2 border rounded-xl hover:bg-white/5 transition-colors"
                                                    style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <CustomSelect
                                                value={supplierId}
                                                onChange={setSupplierId}
                                                options={suppliers.map(s => ({ value: s.id, label: s.name }))}
                                                placeholder="-- Pilih Supplier --"
                                                className="w-full"
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5 flex justify-between" style={{ color: 'var(--foreground)' }}>
                                            <span>Tipe HP</span>
                                            {!isCreatingTipeHp && (
                                                <button type="button" onClick={() => setIsCreatingTipeHp(true)} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                                                    <Plus className="w-3 h-3" /> Baru
                                                </button>
                                            )}
                                        </label>
                                        
                                        {isCreatingTipeHp ? (
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={newTipeHpName}
                                                    onChange={e => setNewTipeHpName(e.target.value)}
                                                    className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                                    style={{ background: 'var(--surface-subtle)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                                                    placeholder="Nama Tipe HP..."
                                                    autoFocus
                                                />
                                                <button 
                                                    type="button" 
                                                    onClick={handleCreateTipeHp}
                                                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium whitespace-nowrap transition-colors"
                                                >
                                                    Simpan
                                                </button>
                                                <button 
                                                    type="button" 
                                                    onClick={() => setIsCreatingTipeHp(false)}
                                                    className="p-2 border rounded-xl hover:bg-white/5 transition-colors"
                                                    style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <CustomSelect
                                                value={tipeHpId}
                                                onChange={setTipeHpId}
                                                options={tipeHps.map(s => ({ value: s.id, label: s.name }))}
                                                placeholder="-- Pilih Tipe HP --"
                                                className="w-full"
                                            />
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>Merk</label>
                                    <input
                                        type="text"
                                        required
                                        value={merk}
                                        onChange={e => setMerk(e.target.value)}
                                        className="w-full px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                        style={{ background: 'var(--surface-subtle)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                                        placeholder="Contoh: Denso, dll"
                                    />
                                </div>

                                {/* Upload Bukti */}
                                <div className="border-t border-white/10 pt-4">
                                    <label className="block text-sm font-medium mb-3 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                                        <ImageIcon className="w-4 h-4 text-indigo-400" />
                                        Upload Bukti Foto (Maks 5)
                                    </label>
                                    
                                    <div className="flex flex-wrap gap-3">
                                        {files.map((file, idx) => (
                                            <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10 group">
                                                <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                    <button 
                                                        type="button" 
                                                        onClick={() => removeFile(idx)}
                                                        className="p-1.5 bg-red-500 rounded-lg text-white hover:bg-red-600 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        
                                        {files.length < 5 && (
                                            <>
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    className="hidden"
                                                    ref={fileInputRef}
                                                    onChange={handleFileChange}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="w-20 h-20 rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-1 hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-colors text-gray-400 hover:text-indigo-400"
                                                >
                                                    <Upload className="w-5 h-5" />
                                                    <span className="text-[10px] font-medium">Upload</span>
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                            </form>
                        </div>
                        
                        <div className="p-5 border-t border-white/5 flex justify-end gap-3" style={{ background: 'var(--surface-overlay)' }}>
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-white/5 transition-colors"
                                style={{ color: 'var(--muted-foreground)' }}
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                form="klaimForm"
                                disabled={isSubmitting}
                                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-colors shadow-lg disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    'Simpan Klaim'
                                )}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
