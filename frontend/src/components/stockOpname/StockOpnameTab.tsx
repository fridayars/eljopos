import { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, Search, Filter, Calendar, User, FileText, CheckCircle2, XCircle, Clock, ChevronRight, Eye, ClipboardList, ChevronDown } from 'lucide-react'
import type { StockOpname } from '../../services/stockOpnameService'
import { stockOpnameService } from '../../services/stockOpnameService'
import { CreateStockOpnameModal } from './CreateStockOpnameModal'
import { StockOpnameDetailModal } from './StockOpnameDetailModal'

function StatusFilterDropdown({ 
    value, 
    onChange 
}: { 
    value: string; 
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

    const options = [
        { id: '', name: 'Semua Status' },
        { id: 'DRAFT', name: 'Draft' },
        { id: 'COMPLETED', name: 'Selesai' },
        { id: 'CANCELLED', name: 'Dibatalkan' },
    ];

    const selectedOption = options.find(o => o.id === value) || options[0];

    return (
        <div className="relative w-full md:w-48" ref={dropdownRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full h-10 px-4 py-2 rounded-xl text-sm flex items-center justify-between cursor-pointer transition-all duration-200 border ${
                    isOpen ? 'border-[#3B82F6] shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'border-[var(--border-subtle)] hover:border-[#3B82F6]/50'
                }`}
                style={{ background: 'var(--surface-overlay)' }}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    <Filter className="w-4 h-4 shrink-0" style={{ color: 'var(--muted-foreground)' }} />
                    <span className="truncate" style={{ color: 'var(--foreground)' }}>{selectedOption.name}</span>
                </div>
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--muted-foreground)' }} />
            </div>

            {isOpen && (
                <div 
                    className="absolute left-0 right-0 top-[calc(100%+8px)] py-1.5 rounded-xl z-[60] shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 border" 
                    style={{ background: 'var(--surface-overlay)', borderColor: 'var(--border-subtle)' }}
                >
                    <ul className="max-h-60 overflow-y-auto">
                        {options.map((opt) => (
                            <li
                                key={opt.id}
                                className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                                    value === opt.id ? 'bg-[#3B82F6]/10 font-semibold' : 'hover:bg-[rgba(255,255,255,0.05)]'
                                }`}
                                style={{ color: value === opt.id ? '#3B82F6' : 'var(--foreground)' }}
                                onClick={() => {
                                    onChange(opt.id);
                                    setIsOpen(false);
                                }}
                            >
                                {opt.name}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export function StockOpnameTab() {
    const [loading, setLoading] = useState(true)
    const [opnames, setOpnames] = useState<StockOpname[]>([])
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
    const [selectedOpnameId, setSelectedOpnameId] = useState<string | null>(null)
    const [search, setSearch] = useState('')

    const openDetail = (id: string) => {
        setSelectedOpnameId(id)
        setIsDetailModalOpen(true)
    }

    const handleEdit = (id: string) => {
        setIsDetailModalOpen(false)
        setSelectedOpnameId(id)
        setIsCreateModalOpen(true)
    }
    const [statusFilter, setStatusFilter] = useState('')
    const [pagination, setPagination] = useState({
        page: 1,
        total_pages: 1
    })

    const fetchOpnames = useCallback(async () => {
        try {
            setLoading(true)
            const response = await stockOpnameService.getAll({
                page: pagination.page,
                search,
                status: statusFilter
            })
            if (response.success) {
                setOpnames(response.data.items)
                setPagination({
                    page: response.data.pagination.page,
                    total_pages: response.data.pagination.total_pages
                })
            }
        } catch (error) {
            console.error('Failed to fetch stock opnames:', error)
        } finally {
            setLoading(false)
        }
    }, [pagination.page, search, statusFilter])

    useEffect(() => {
        fetchOpnames()
    }, [fetchOpnames])

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return { 
                    bg: 'rgba(34, 197, 94, 0.15)', 
                    color: '#22C55E', 
                    icon: CheckCircle2,
                    label: 'Selesai'
                }
            case 'CANCELLED':
                return { 
                    bg: 'rgba(239, 68, 68, 0.15)', 
                    color: '#EF4444', 
                    icon: XCircle,
                    label: 'Dibatalkan'
                }
            default:
                return { 
                    bg: 'rgba(234, 179, 8, 0.15)', 
                    color: '#EAB308', 
                    icon: Clock,
                    label: 'Draft'
                }
        }
    }

    return (
        <div className="flex-1 flex flex-col h-full overscroll-none overflow-hidden bg-[var(--background)]">
            {/* Header section */}
            <div className="p-6 pb-2 shrink-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>Stok Opname</h1>
                        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Kelola dan pantau penyesuaian stok produk Anda</p>
                    </div>
                    <button
                        onClick={() => {
                            setSelectedOpnameId(null)
                            setIsCreateModalOpen(true)
                        }}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                        style={{
                            background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                            color: 'white',
                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                        }}
                    >
                        <Plus className="w-5 h-5" />
                        Buat Opname Baru
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors group-focus-within:text-[#3B82F6]" style={{ color: 'var(--muted-foreground)' }} />
                        <input
                            type="text"
                            placeholder="Cari nomor opname..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all duration-200 outline-none"
                            style={{
                                background: 'var(--surface-overlay)',
                                border: '1px solid var(--border-subtle)',
                                color: 'var(--foreground)'
                            }}
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <StatusFilterDropdown 
                            value={statusFilter}
                            onChange={setStatusFilter}
                        />
                    </div>
                </div>
            </div>

            {/* List Table */}
            <div className="flex-1 overflow-auto px-6 pb-6 mt-2">
                <div 
                    className="rounded-2xl overflow-hidden"
                    style={{ 
                        background: 'var(--surface-overlay)',
                        border: '1px solid var(--border-subtle)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)'
                    }}
                >
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-10 h-10 border-4 border-t-[#3B82F6] border-[rgba(59,130,246,0.1)] rounded-full animate-spin" />
                            <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>Memuat data stok opname...</p>
                        </div>
                    ) : opnames.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'var(--surface-subtle)' }}>
                                <ClipboardList className="w-8 h-8 opacity-20" />
                            </div>
                            <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--foreground)' }}>Tidak Ada Data</h3>
                            <p className="text-sm max-w-xs mx-auto" style={{ color: 'var(--muted-foreground)' }}>
                                Belum ada riwayat stok opname. Klik tombol "Buat Opname Baru" untuk memulai.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>No. Opname</th>
                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Tanggal</th>
                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Petugas</th>
                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Keterangan</th>
                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-center" style={{ color: 'var(--muted-foreground)' }}>Status</th>
                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-right" style={{ color: 'var(--muted-foreground)' }}>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border-subtle)]">
                                    {opnames.map((opname) => {
                                        const status = getStatusStyles(opname.status)
                                        const StatusIcon = status.icon
                                        return (
                                            <tr 
                                                key={opname.id}
                                                onClick={() => openDetail(opname.id)}
                                                className="group transition-colors hover:bg-[rgba(255,255,255,0.02)] cursor-pointer"
                                            >
                                                <td className="px-6 py-4 font-medium" style={{ color: 'var(--foreground)' }}>
                                                    {opname.opname_number}
                                                </td>
                                                <td className="px-6 py-4 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 opacity-50" />
                                                        {new Date(opname.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm" style={{ color: 'var(--foreground)' }}>
                                                    <div className="flex items-center gap-2">
                                                        <User className="w-4 h-4 opacity-50" />
                                                        {opname.user?.username || 'System'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm max-w-xs truncate" style={{ color: 'var(--muted-foreground)' }}>
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="w-4 h-4 opacity-50" />
                                                        {opname.keterangan || '-'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span 
                                                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider"
                                                        style={{ background: status.bg, color: status.color }}
                                                    >
                                                        <StatusIcon className="w-3.5 h-3.5" />
                                                        {status.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                    <button 
                                                        onClick={() => openDetail(opname.id)}
                                                        className="p-2 rounded-lg hover:bg-[rgba(59,130,246,0.1)] transition-colors cursor-pointer group/btn"
                                                        title="Lihat Detail"
                                                    >
                                                        <Eye className="w-4 h-4 transition-colors group-hover/btn:text-[#3B82F6]" style={{ color: 'var(--muted-foreground)' }} />
                                                    </button>
                                                    <button 
                                                        className="p-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-colors cursor-pointer"
                                                        title="Lainnya"
                                                    >
                                                        <ChevronRight className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                
                {/* Pagination */}
                {opnames.length > 0 && (
                    <div className="mt-4 flex items-center justify-between px-2">
                        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                            Halaman {pagination.page} dari {pagination.total_pages}
                        </p>
                        <div className="flex items-center gap-2">
                            <button 
                                disabled={pagination.page === 1}
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                className="px-4 py-2 rounded-xl text-xs font-medium disabled:opacity-30 transition-all border border-[var(--border-subtle)] cursor-pointer"
                                style={{ background: 'var(--surface-overlay)', color: 'var(--foreground)' }}
                            >
                                Sebelumnya
                            </button>
                            <button 
                                disabled={pagination.page === pagination.total_pages}
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                className="px-4 py-2 rounded-xl text-xs font-medium disabled:opacity-30 transition-all border border-[var(--border-subtle)] cursor-pointer"
                                style={{ background: 'var(--surface-overlay)', color: 'var(--foreground)' }}
                            >
                                Selanjutnya
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <CreateStockOpnameModal 
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false)
                    setSelectedOpnameId(null)
                }}
                onSuccess={fetchOpnames}
                editOpnameId={selectedOpnameId}
            />

            <StockOpnameDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => {
                    setIsDetailModalOpen(false)
                    setSelectedOpnameId(null)
                }}
                opnameId={selectedOpnameId}
                onUpdate={fetchOpnames}
                onEdit={handleEdit}
            />
        </div>
    )
}
