import { useState, useEffect } from 'react'
import { ArrowDownCircle, ArrowUpCircle, RefreshCw, Trash2, Wallet } from 'lucide-react'
import { motion } from 'motion/react'
import { arusUangService } from '../services/arusUangService'
import type { ArusUang, ArusUangSummary } from '../services/arusUangService'
import { ArusUangModal } from '../components/arusUang/ArusUangModal'

export function ArusUangPage() {
    const [data, setData] = useState<ArusUang[]>([])
    const [summary, setSummary] = useState<ArusUangSummary | null>(null)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [isLoading, setIsLoading] = useState(true)
    const [isSyncing, setIsSyncing] = useState(false)
    
    // Filters
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [typeFilter, setTypeFilter] = useState('')

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalType, setModalType] = useState<'IN' | 'OUT'>('IN')

    const [userPermissions] = useState<string[]>(() => {
        try {
            const token = localStorage.getItem('token')
            if (token) {
                const payload = JSON.parse(atob(token.split('.')[1]))
                return payload.permissions || []
            }
        } catch {
            return []
        }
        return []
    })

    const hasPermission = (perm: string) => userPermissions.includes(perm)

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const result = await arusUangService.getList({
                page,
                limit: 20,
                start_date: startDate || undefined,
                end_date: endDate || undefined,
                type: typeFilter || undefined
            })
            setData(result.items)
            setSummary(result.summary)
            setTotalPages(result.meta.total_pages)
        } catch {
            // Error managed silently or can use toast
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [page, startDate, endDate, typeFilter])

    const handleSync = async () => {
        if (!window.confirm('Apakah Anda yakin ingin menyinkronkan data histori transaksi ke ledger Arus Uang? Proses ini aman dan hanya menambahkan data yang belum ada.')) return
        
        setIsSyncing(true)
        try {
            const result = await arusUangService.syncData()
            alert(`Berhasil sinkronisasi. ${result.data?.synced_records} data baru ditambahkan.`)
            fetchData()
        } catch (err: any) {
            alert(err?.response?.data?.message || 'Gagal sinkronisasi data')
        } finally {
            setIsSyncing(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus data arus kas ini?')) return
        try {
            await arusUangService.deleteManual(id)
            fetchData()
        } catch (err: any) {
            alert(err?.response?.data?.message || 'Gagal menghapus data')
        }
    }

    const formatCurrency = (amount: number | string) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(amount))
    }

    const openModal = (type: 'IN' | 'OUT') => {
        setModalType(type)
        setIsModalOpen(true)
    }

    return (
        <div className="flex-1 flex flex-col h-full overflow-y-auto p-6 gap-6 relative" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
            {/* Header & Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
                        Arus Uang
                    </h1>
                    <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        Kelola dan pantau seluruh transaksi kas masuk dan keluar
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="px-4 py-2 rounded-xl text-sm font-medium border border-white/10 transition-colors flex items-center gap-2 cursor-pointer"
                        style={{ background: 'var(--surface-overlay)' }}
                    >
                        <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                        Sync Histori
                    </button>

                    {hasPermission('arusuang.create_in') && (
                        <button
                            onClick={() => openModal('IN')}
                            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg flex items-center gap-2 cursor-pointer"
                        >
                            <ArrowDownCircle className="w-4 h-4" />
                            Uang Masuk
                        </button>
                    )}

                    {hasPermission('arusuang.create_out') && (
                        <button
                            onClick={() => openModal('OUT')}
                            className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-400 hover:to-orange-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg flex items-center gap-2 cursor-pointer"
                        >
                            <ArrowUpCircle className="w-4 h-4" />
                            Uang Keluar
                        </button>
                    )}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-5 rounded-2xl border border-white/5 relative overflow-hidden" style={{ background: 'var(--surface-color)' }}>
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <ArrowDownCircle className="w-16 h-16 text-emerald-500" />
                    </div>
                    <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>Total Pemasukan</p>
                    <p className="text-2xl font-bold mt-1 text-emerald-500">
                        {summary ? formatCurrency(summary.total_in) : 'Rp 0'}
                    </p>
                </motion.div>
                
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-5 rounded-2xl border border-white/5 relative overflow-hidden" style={{ background: 'var(--surface-color)' }}>
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <ArrowUpCircle className="w-16 h-16 text-red-500" />
                    </div>
                    <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>Total Pengeluaran</p>
                    <p className="text-2xl font-bold mt-1 text-red-500">
                        {summary ? formatCurrency(summary.total_out) : 'Rp 0'}
                    </p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="p-5 rounded-2xl border border-white/5 relative overflow-hidden" style={{ background: 'var(--surface-color)' }}>
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Wallet className="w-16 h-16 text-blue-500" />
                    </div>
                    <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>Saldo Kas</p>
                    <p className="text-2xl font-bold mt-1 text-blue-500">
                        {summary ? formatCurrency(summary.current_balance) : 'Rp 0'}
                    </p>
                </motion.div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-2xl border border-white/5" style={{ background: 'var(--surface-color)' }}>
                <div className="flex-1">
                    <label className="block text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>Dari Tanggal</label>
                    <input 
                        type="date" 
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-sm border focus:outline-none" 
                        style={{ background: 'var(--surface-subtle)', borderColor: 'var(--border-subtle)', color: 'var(--foreground)' }}
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>Sampai Tanggal</label>
                    <input 
                        type="date" 
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-sm border focus:outline-none" 
                        style={{ background: 'var(--surface-subtle)', borderColor: 'var(--border-subtle)', color: 'var(--foreground)' }}
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>Jenis Transaksi</label>
                    <select 
                        value={typeFilter}
                        onChange={e => setTypeFilter(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-sm border focus:outline-none" 
                        style={{ background: 'var(--surface-subtle)', borderColor: 'var(--border-subtle)', color: 'var(--foreground)' }}
                    >
                        <option value="">Semua Jenis</option>
                        <option value="IN">Uang Masuk</option>
                        <option value="OUT">Uang Keluar</option>
                    </select>
                </div>
                <div className="flex items-end">
                    <button 
                        onClick={() => { setStartDate(''); setEndDate(''); setTypeFilter(''); setPage(1); }}
                        className="px-4 py-2 rounded-xl text-sm border border-white/10 hover:bg-white/5"
                    >
                        Reset
                    </button>
                </div>
            </div>

            {/* Data Table */}
            <div className="rounded-2xl border border-white/5 overflow-hidden" style={{ background: 'var(--surface-color)' }}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr style={{ background: 'var(--surface-subtle)', color: 'var(--muted-foreground)' }}>
                                <th className="p-4 text-xs font-semibold whitespace-nowrap">Tanggal</th>
                                <th className="p-4 text-xs font-semibold whitespace-nowrap">Keterangan</th>
                                <th className="p-4 text-xs font-semibold whitespace-nowrap">Sumber</th>
                                <th className="p-4 text-xs font-semibold whitespace-nowrap">Metode</th>
                                <th className="p-4 text-xs font-semibold whitespace-nowrap text-right">Nominal</th>
                                <th className="p-4 text-xs font-semibold whitespace-nowrap text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>Memuat data...</td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>Tidak ada data ditemukan</td>
                                </tr>
                            ) : (
                                data.map((item) => (
                                    <tr key={item.id} className="border-t border-white/5 transition-colors hover:bg-white/[0.02]">
                                        <td className="p-4 text-sm whitespace-nowrap">
                                            {new Date(item.date).toLocaleDateString('id-ID', { year:'numeric', month:'short', day:'numeric' })}
                                        </td>
                                        <td className="p-4 text-sm">
                                            <div className="font-medium">{item.description || '-'}</div>
                                            {item.creator && <div className="text-xs opacity-50 mt-1">Oleh: {item.creator.username}</div>}
                                        </td>
                                        <td className="p-4 text-sm">
                                            <span className="px-2 py-1 rounded text-xs" style={{ background: 'var(--surface-subtle)' }}>
                                                {item.source}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm">
                                            <span className="px-2 py-1 rounded text-xs" style={{ background: 'var(--surface-subtle)' }}>
                                                {item.payment_method.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-right font-medium">
                                            {item.type === 'IN' ? (
                                                <span className="text-emerald-500">+ {formatCurrency(item.amount)}</span>
                                            ) : (
                                                <span className="text-red-500">- {formatCurrency(item.amount)}</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-sm text-center">
                                            {item.source === 'MANUAL' && (
                                                ((item.type === 'IN' && hasPermission('arusuang.delete_in')) || 
                                                 (item.type === 'OUT' && hasPermission('arusuang.delete_out'))) && (
                                                    <button 
                                                        onClick={() => handleDelete(item.id)}
                                                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors"
                                                        title="Hapus Manual"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!isLoading && data.length > 0 && (
                    <div className="p-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                            Halaman {page} dari {totalPages}
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                                className="px-3 py-1.5 text-sm rounded-lg border border-white/10 disabled:opacity-50 transition-colors cursor-pointer"
                                style={{ background: 'var(--surface-subtle)' }}
                            >
                                Sebelumnya
                            </button>
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage(page + 1)}
                                className="px-3 py-1.5 text-sm rounded-lg border border-white/10 disabled:opacity-50 transition-colors cursor-pointer"
                                style={{ background: 'var(--surface-subtle)' }}
                            >
                                Selanjutnya
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <ArusUangModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    type={modalType}
                    onSuccess={() => {
                        setIsModalOpen(false)
                        fetchData()
                    }}
                />
            )}
        </div>
    )
}
