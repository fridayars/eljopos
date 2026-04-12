import { motion, AnimatePresence } from 'motion/react'
import { X, Loader2, ChevronDown } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import type { Customer } from '../../services/customerService'
import type { WilayahItem } from '../../services/wilayahService'
import { getProvinces, getRegencies, getDistricts } from '../../services/wilayahService'

// ─── Reusable Wilayah Dropdown ─────────────────────────────────────────────
interface WilayahDropdownProps {
    label: string
    required?: boolean
    placeholder: string
    options: WilayahItem[]
    value: WilayahItem | null
    onChange: (item: WilayahItem | null) => void
    disabled?: boolean
    isLoading?: boolean
    error?: string
}

function WilayahDropdown({
    label,
    required,
    placeholder,
    options,
    value,
    onChange,
    disabled = false,
    isLoading = false,
    error,
}: WilayahDropdownProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const ref = useRef<HTMLDivElement>(null)
    const searchRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Reset search & close when disabled
    useEffect(() => {
        if (disabled) {
            setIsOpen(false)
            setSearchQuery('')
        }
    }, [disabled])

    // Focus search input when dropdown opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => searchRef.current?.focus(), 50)
        } else {
            setSearchQuery('')
        }
    }, [isOpen])

    const isDisabled = disabled || isLoading

    return (
        <div className="space-y-2" ref={ref}>
            <label className="text-sm text-gray-400">
                {label} {required && <span className="text-red-400">*</span>}
            </label>
            <div
                onClick={() => !isDisabled && setIsOpen((prev) => !prev)}
                className={`relative w-full h-12 border rounded-xl px-4 flex items-center justify-between transition-all
                    ${isDisabled ? 'opacity-50 cursor-not-allowed bg-white/3' : 'cursor-pointer bg-white/5'}
                    ${error
                        ? 'border-red-500/50'
                        : isOpen
                            ? 'border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                            : 'border-purple-500/20 hover:border-purple-500/40'
                    }`}
            >
                <span className={`text-sm truncate pr-2 ${value ? 'text-gray-200' : 'text-gray-600'}`}>
                    {isLoading ? 'Memuat data...' : (value?.name || placeholder)}
                </span>
                {isLoading
                    ? <Loader2 className="w-4 h-4 shrink-0 animate-spin text-gray-500" />
                    : <ChevronDown className={`w-4 h-4 shrink-0 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                }
            </div>

            {isOpen && !isDisabled && (
                <div className="absolute z-[70] left-0 right-0 mt-1 rounded-xl overflow-hidden shadow-2xl border border-purple-500/20 bg-[#1a1625]">
                    {/* Search */}
                    <div className="p-2 border-b border-purple-500/10">
                        <input
                            ref={searchRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari..."
                            onClick={(e) => e.stopPropagation()}
                            className="w-full h-8 bg-white/5 border border-purple-500/20 rounded-lg px-3 text-sm text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/40 transition-all"
                        />
                    </div>
                    <ul className="max-h-44 overflow-y-auto">
                        {(() => {
                            const filtered = options.filter((o) =>
                                o.name.toLowerCase().includes(searchQuery.toLowerCase())
                            )
                            return filtered.length === 0 ? (
                                <li className="px-4 py-3 text-sm text-gray-500 italic">Tidak ada data</li>
                            ) : (
                                filtered.map((item) => (
                                    <li
                                        key={item.code}
                                        onClick={() => {
                                            onChange(item)
                                            setIsOpen(false)
                                        }}
                                        className={`px-4 py-3 text-sm cursor-pointer transition-colors
                                            ${value?.code === item.code
                                                ? 'text-purple-400 bg-purple-500/10'
                                                : 'text-gray-300 hover:bg-white/5'
                                            }`}
                                    >
                                        {item.name}
                                    </li>
                                ))
                            )
                        })()}
                    </ul>
                </div>
            )}
            {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
    )
}

// ─── AddCustomerModal ────────────────────────────────────────────────────────
interface AddCustomerModalProps {
    isOpen: boolean
    onClose: () => void
    onAddCustomer: (customer: Omit<Customer, 'id'>) => Promise<void>
}

type WilayahErrors = {
    province?: string
    regency?: string
    district?: string
}

export function AddCustomerModal({ isOpen, onClose, onAddCustomer }: AddCustomerModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
    })

    // Wilayah state
    const [provinces, setProvinces] = useState<WilayahItem[]>([])
    const [regencies, setRegencies] = useState<WilayahItem[]>([])
    const [districts, setDistricts] = useState<WilayahItem[]>([])

    const [selectedProvince, setSelectedProvince] = useState<WilayahItem | null>(null)
    const [selectedRegency, setSelectedRegency] = useState<WilayahItem | null>(null)
    const [selectedDistrict, setSelectedDistrict] = useState<WilayahItem | null>(null)

    const [loadingProvinces, setLoadingProvinces] = useState(false)
    const [loadingRegencies, setLoadingRegencies] = useState(false)
    const [loadingDistricts, setLoadingDistricts] = useState(false)

    const [errors, setErrors] = useState<{ name?: string; phone?: string } & WilayahErrors>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Load provinces when modal opens
    useEffect(() => {
        if (isOpen && provinces.length === 0) {
            setLoadingProvinces(true)
            getProvinces().then((res) => {
                if (res.success) setProvinces(res.data)
                setLoadingProvinces(false)
            })
        }
    }, [isOpen])

    // Reset on close
    useEffect(() => {
        if (!isOpen) {
            setFormData({ name: '', phone: '', email: '', address: '' })
            setErrors({})
            setIsSubmitting(false)
            setSelectedProvince(null)
            setSelectedRegency(null)
            setSelectedDistrict(null)
            setRegencies([])
            setDistricts([])
        }
    }, [isOpen])

    // Load regencies when province changes
    const handleProvinceChange = async (item: WilayahItem | null) => {
        setSelectedProvince(item)
        setSelectedRegency(null)
        setSelectedDistrict(null)
        setRegencies([])
        setDistricts([])
        if (errors.province) setErrors((prev) => ({ ...prev, province: undefined }))

        if (item) {
            setLoadingRegencies(true)
            const res = await getRegencies(item.code)
            if (res.success) setRegencies(res.data)
            setLoadingRegencies(false)
        }
    }

    // Load districts when regency changes
    const handleRegencyChange = async (item: WilayahItem | null) => {
        setSelectedRegency(item)
        setSelectedDistrict(null)
        setDistricts([])
        if (errors.regency) setErrors((prev) => ({ ...prev, regency: undefined }))

        if (item) {
            setLoadingDistricts(true)
            const res = await getDistricts(item.code)
            if (res.success) setDistricts(res.data)
            setLoadingDistricts(false)
        }
    }

    const handleDistrictChange = (item: WilayahItem | null) => {
        setSelectedDistrict(item)
        if (errors.district) setErrors((prev) => ({ ...prev, district: undefined }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const newErrors: typeof errors = {}
        if (!formData.name.trim()) newErrors.name = 'Nama wajib diisi'
        if (!formData.phone.trim()) newErrors.phone = 'Nomor telepon wajib diisi'
        if (!selectedProvince) newErrors.province = 'Provinsi wajib dipilih'
        if (!selectedRegency) newErrors.regency = 'Kabupaten/Kota wajib dipilih'
        if (!selectedDistrict) newErrors.district = 'Kecamatan wajib dipilih'

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        setIsSubmitting(true)
        try {
            await onAddCustomer({
                ...formData,
                province_code: selectedProvince!.code,
                province_name: selectedProvince!.name,
                regency_code: selectedRegency!.code,
                regency_name: selectedRegency!.name,
                district_code: selectedDistrict!.code,
                district_name: selectedDistrict!.name,
            })
            onClose()
        } catch {
            // error handled by parent
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
        if (errors[field as keyof typeof errors]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }))
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md z-50"
                    >
                        <div className="backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-[0_0_50px_rgba(59,130,246,0.3)] overflow-hidden" style={{ background: 'var(--background)' }}>
                            {/* Header */}
                            <div className="relative p-6 border-b border-purple-500/20">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-600/10" />
                                <div className="relative flex items-center justify-between">
                                    <h2 className="text-xl text-gray-200">Tambah Customer Baru</h2>
                                    <button
                                        onClick={onClose}
                                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Form */}
                            <div className="overflow-y-auto max-h-[calc(100svh-12rem)]">
                                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                    {/* Name */}
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">
                                            Nama Customer <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => handleChange('name', e.target.value)}
                                            placeholder="Ketikkan nama..."
                                            className={`w-full h-12 bg-white/5 border rounded-xl px-4 text-gray-300 placeholder:text-gray-600 focus:outline-none transition-all ${errors.name
                                                ? 'border-red-500/50 focus:border-red-500/70'
                                                : 'border-purple-500/20 focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                                                }`}
                                        />
                                        {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
                                    </div>

                                    {/* Phone */}
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">
                                            Nomor Telepon <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => handleChange('phone', e.target.value)}
                                            placeholder="Cth: 081234567890"
                                            className={`w-full h-12 bg-white/5 border rounded-xl px-4 text-gray-300 placeholder:text-gray-600 focus:outline-none transition-all ${errors.phone
                                                ? 'border-red-500/50 focus:border-red-500/70'
                                                : 'border-purple-500/20 focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                                                }`}
                                        />
                                        {errors.phone && <p className="text-xs text-red-400">{errors.phone}</p>}
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">Email</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleChange('email', e.target.value)}
                                            placeholder="Alamat email..."
                                            className="w-full h-12 bg-white/5 border border-purple-500/20 rounded-xl px-4 text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all"
                                        />
                                    </div>

                                    {/* Address */}
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">Alamat</label>
                                        <textarea
                                            value={formData.address}
                                            onChange={(e) => handleChange('address', e.target.value)}
                                            placeholder="Alamat lengkap..."
                                            rows={3}
                                            className="w-full bg-white/5 border border-purple-500/20 rounded-xl px-4 py-3 text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all resize-none"
                                        />
                                    </div>

                                    {/* Wilayah Dropdowns */}
                                    <div className="relative">
                                        <WilayahDropdown
                                            label="Provinsi"
                                            required
                                            placeholder="Pilih provinsi..."
                                            options={provinces}
                                            value={selectedProvince}
                                            onChange={handleProvinceChange}
                                            isLoading={loadingProvinces}
                                            error={errors.province}
                                        />
                                    </div>

                                    <div className="relative">
                                        <WilayahDropdown
                                            label="Kabupaten / Kota"
                                            required
                                            placeholder={selectedProvince ? 'Pilih kabupaten/kota...' : 'Pilih provinsi dulu'}
                                            options={regencies}
                                            value={selectedRegency}
                                            onChange={handleRegencyChange}
                                            disabled={!selectedProvince}
                                            isLoading={loadingRegencies}
                                            error={errors.regency}
                                        />
                                    </div>

                                    <div className="relative">
                                        <WilayahDropdown
                                            label="Kecamatan"
                                            required
                                            placeholder={selectedRegency ? 'Pilih kecamatan...' : 'Pilih kabupaten/kota dulu'}
                                            options={districts}
                                            value={selectedDistrict}
                                            onChange={handleDistrictChange}
                                            disabled={!selectedRegency}
                                            isLoading={loadingDistricts}
                                            error={errors.district}
                                        />
                                    </div>

                                    {/* Footer */}
                                    <div className="pt-2 flex gap-3">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            disabled={isSubmitting}
                                            className="flex-1 h-12 rounded-xl border border-purple-500/30 text-gray-400 hover:text-gray-200 hover:border-purple-500/50 transition-all cursor-pointer disabled:opacity-50"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="flex-1 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all font-semibold cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Menyimpan...
                                                </>
                                            ) : (
                                                'Simpan'
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
