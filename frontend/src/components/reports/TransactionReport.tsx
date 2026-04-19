import { useState, useEffect, useCallback } from 'react';
import { Search, Download, Calendar, Eye, X, Loader2, Store, MessageCircle, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

import {
    getTransactionHistory,
    getTransactionDetail,
    deleteTransaction,
} from '../../services/reportService';
import type {
    TransactionHistoryItem,
    TransactionHistorySummary,
    TransactionDetailData,
} from '../../services/reportService';
import { DeleteTransactionModal } from './DeleteTransactionModal';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

export function TransactionReport() {
    // Date range filter
    const today = new Date().toISOString().split('T')[0];

    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [userPermissions, setUserPermissions] = useState<string[]>([]);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                setUserPermissions(user.permissions || []);
            } catch {
                // Ignore parsing errors
            }
        }
    }, []);

    // Data
    const [transactions, setTransactions] = useState<TransactionHistoryItem[]>([]);
    const [summary, setSummary] = useState<TransactionHistorySummary>({ total_revenue: 0, total_transactions: 0, payment_summary: [] });


    // Detail modal
    const [selectedDetail, setSelectedDetail] = useState<TransactionDetailData | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isDetailLoading, setIsDetailLoading] = useState(false);

    // Delete modal
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState<TransactionHistoryItem | null>(null);

    // Loading
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch transactions when filters change
    const fetchTransactions = useCallback(async (page: number, reset: boolean = false) => {
        setIsLoading(true);
        try {
            const res = await getTransactionHistory({
                start_date: startDate,
                end_date: endDate,
                page,
                limit: 20,
            });

            if (res.success) {
                setTransactions(prev => reset ? res.data.items : [...prev, ...res.data.items]);
                setHasMore(res.data.meta.page < res.data.meta.total_pages);
                setSummary(res.data.summary);
                setCurrentPage(page);
            } else {
                toast.error(res.message || 'Gagal memuat data transaksi');
            }
        } catch {
            toast.error('Gagal memuat data transaksi');
        } finally {
            setIsLoading(false);
        }
    }, [startDate, endDate]);

    useEffect(() => {
        fetchTransactions(1, true);
    }, [fetchTransactions]);

    // Intersection Observer for Infinite Scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoading) {
                    fetchTransactions(currentPage + 1, false);
                }
            },
            { threshold: 0.1 }
        );

        const loadMoreTrigger = document.getElementById('load-more-trigger');
        if (loadMoreTrigger) observer.observe(loadMoreTrigger);

        return () => observer.disconnect();
    }, [hasMore, isLoading, currentPage, fetchTransactions]);

    // Client-side search filter (search on already-fetched page)
    const filteredTransactions = transactions.filter((t) => {
        if (!debouncedSearch) return true;
        const q = debouncedSearch.toLowerCase();
        return (
            t.invoice_number?.toLowerCase().includes(q) ||
            t.customer_name?.toLowerCase().includes(q) ||
            t.kasir?.toLowerCase().includes(q) ||
            t.store?.toLowerCase().includes(q)
        );
    });

    // View detail
    const handleViewDetail = async (transaction: TransactionHistoryItem) => {
        setIsDetailLoading(true);
        setIsDetailOpen(true);
        try {
            const res = await getTransactionDetail(transaction.id);
            if (res.success) {
                setSelectedDetail(res.data);
            } else {
                toast.error('Gagal memuat detail transaksi');
                setIsDetailOpen(false);
            }
        } catch {
            toast.error('Gagal memuat detail transaksi');
            setIsDetailOpen(false);
        } finally {
            setIsDetailLoading(false);
        }
    };

    // Export
    const handleExport = () => {
        const exportData = filteredTransactions.map((t) => ({
            'Nomor Invoice': t.invoice_number,
            'Tanggal': formatDate(t.created_at),
            'Pelanggan': t.customer_name || 'Walk-in',
            'Kasir': t.kasir || '-',
            'Cabang': t.store || '-',
            'Tipe': t.type || '-',
            'Total': t.total_amount,
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
        XLSX.writeFile(workbook, `laporan_transaksi_${new Date().toISOString().split('T')[0]}.xlsx`);
        toast.success('Laporan transaksi berhasil diekspor ke Excel');
    };

    const confirmDelete = (e: React.MouseEvent, transaction: TransactionHistoryItem) => {
        e.stopPropagation();
        setTransactionToDelete(transaction);
        setIsDeleteDialogOpen(true);
    };

    const executeDelete = async () => {
        if (!transactionToDelete) return;

        try {
            const res = await deleteTransaction(transactionToDelete.id);
            if (res.success) {
                toast.success('Transaksi berhasil dihapus');
                fetchTransactions(1, true);
                if (isDetailOpen && selectedDetail?.id === transactionToDelete.id) {
                    setIsDetailOpen(false);
                }
            } else {
                toast.error(res.message || 'Gagal menghapus transaksi');
            }
        } catch {
            toast.error('Gagal menghapus transaksi');
        } finally {
            setIsDeleteDialogOpen(false);
            setTransactionToDelete(null);
        }
    };

    return (
        <div className="p-4 md:p-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-[#121E19]/40 backdrop-blur-xl border border-green-500/20 rounded-2xl p-5 relative overflow-hidden group">
                    <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">Total Pendapatan</p>
                    <p className="text-xl md:text-2xl text-green-400 font-bold">{formatCurrency(summary.total_revenue)}</p>
                </div>
                <div className="bg-[#12181E]/40 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-5 relative overflow-hidden group">
                    <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">Total Transaksi</p>
                    <p className="text-xl md:text-2xl text-cyan-400 font-bold">{summary.total_transactions}</p>
                </div>
            </div>

            {/* Cash Box Summary (Breakdown per Payment Method) */}
            {summary.payment_summary && summary.payment_summary.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {summary.payment_summary.map((payment, idx) => (
                        <div
                            key={idx}
                            className="bg-white/5 backdrop-blur-xl border border-purple-500/10 rounded-2xl p-4 flex flex-col justify-between"
                        >
                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1 italic">
                                {payment.method}
                            </p>
                            <p className="text-lg text-gray-200 font-bold">
                                {formatCurrency(payment.total)}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Filters & Actions Toolbar */}
            <div className="flex flex-col xl:flex-row gap-4 mb-6">
                {/* Date Range */}
                <div className="flex items-center gap-3 p-2 bg-white/5 border border-purple-500/10 rounded-2xl">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-purple-500/10">
                        <Calendar className="w-4 h-4 text-purple-400" />
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-transparent border-none text-xs md:text-sm text-gray-200 focus:outline-none focus:ring-0 [color-scheme:dark]"
                        />
                        <span className="text-gray-600 text-xs font-bold px-1">s/d</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-transparent border-none text-xs md:text-sm text-gray-200 focus:outline-none focus:ring-0 [color-scheme:dark]"
                        />
                    </div>
                </div>

                {/* Search & Export */}
                <div className="flex flex-1 gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Cari invoice, pelanggan, kasir..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-full pl-11 pr-4 py-3 bg-white/5 border border-purple-500/20 rounded-2xl text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500/40 transition-all"
                        />
                    </div>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400 hover:text-white hover:from-cyan-500 hover:to-blue-600 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all cursor-pointer whitespace-nowrap font-medium text-sm"
                    >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Ekspor Excel</span>
                        <span className="sm:hidden">Ekspor</span>
                    </button>
                </div>
            </div>

            {/* Transaction Table */}
            <div className="bg-white/5 backdrop-blur-xl border border-purple-500/20 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-white/5 border-b border-purple-500/20">
                                <th className="text-left text-sm text-gray-400 py-4 px-4 font-medium">No. Invoice</th>
                                <th className="text-left text-sm text-gray-400 py-4 px-4 font-medium">Tanggal</th>
                                <th className="text-left text-sm text-gray-400 py-4 px-4 font-medium">Pelanggan</th>
                                <th className="text-left text-sm text-gray-400 py-4 px-4 font-medium">Kasir</th>
                                <th className="text-left text-sm text-gray-400 py-4 px-4 font-medium">Cabang</th>
                                <th className="text-left text-sm text-gray-400 py-4 px-4 font-medium">Tipe</th>
                                <th className="text-right text-sm text-gray-400 py-4 px-4 font-medium">Total</th>
                                <th className="text-center text-sm text-gray-400 py-4 px-4 font-medium">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-purple-500/10">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={8} className="py-12 text-center">
                                        <div className="flex items-center justify-center gap-2 text-gray-500">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Memuat data...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-12 text-center text-gray-500">Tidak ada transaksi ditemukan</td>
                                </tr>
                            ) : (
                                filteredTransactions.map((transaction) => (
                                    <tr
                                        key={transaction.id}
                                        className="hover:bg-white/5 transition-colors cursor-pointer"
                                        onClick={() => handleViewDetail(transaction)}
                                    >
                                        <td className="py-4 px-4">
                                            <span className="text-cyan-400 text-sm font-medium">{transaction.invoice_number}</span>
                                        </td>
                                        <td className="py-4 px-4 text-gray-300 text-sm">
                                            {formatDate(transaction.created_at)}
                                        </td>
                                        <td className="py-4 px-4 text-gray-300 text-sm">{transaction.customer_name || 'Walk-in'}</td>
                                        <td className="py-4 px-4 text-gray-300 text-sm">{transaction.kasir || '-'}</td>
                                        <td className="py-4 px-4 text-gray-300 text-sm text-ellipsis overflow-hidden whitespace-nowrap max-w-[150px]">
                                            {transaction.store || '-'}
                                        </td>
                                        <td className="py-4 px-4">
                                            {transaction.type && (
                                                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${transaction.type === 'layanan'
                                                    ? 'bg-blue-500/20 text-blue-400'
                                                    : 'bg-purple-500/20 text-purple-400'
                                                    }`}>
                                                    {transaction.type === 'layanan' ? 'Layanan' : 'Produk'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-4 text-right text-cyan-400 font-medium">
                                            {formatCurrency(transaction.total_amount)}
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleViewDetail(transaction);
                                                    }}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 hover:bg-cyan-500/30 transition-all text-xs font-medium"
                                                >
                                                    <Eye className="w-3 h-3" />
                                                    Detail
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Infinite Scroll Trigger */}
                <div id="load-more-trigger" className="h-20 flex flex-col items-center justify-center border-t border-purple-500/10 shrink-0">
                    {isLoading && (
                        <div className="flex items-center gap-2 text-purple-400">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span className="text-sm">Memuat lebih banyak...</span>
                        </div>
                    )}
                    {!hasMore && filteredTransactions.length > 0 && (
                        <p className="text-xs text-gray-600 italic">Semua transaksi telah dimuat</p>
                    )}
                </div>
            </div>

            {/* Transaction Detail Modal */}
            <AnimatePresence>
                {isDetailOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsDetailOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 cursor-default"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-[0_0_40px_rgba(139,92,246,0.3)] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" style={{ background: 'var(--surface-modal)' }}>
                                {isDetailLoading || !selectedDetail ? (
                                    <div className="flex-1 flex items-center justify-center p-12">
                                        <div className="flex items-center gap-3 text-gray-500">
                                            <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                                            <span>Memuat detail transaksi...</span>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {/* Header */}
                                        <div className="p-6 border-b border-purple-500/20 flex items-center justify-between shrink-0">
                                            <div>
                                                <h2 className="text-xl md:text-2xl text-gray-200">Detail Transaksi</h2>
                                                <p className="text-sm text-cyan-400 mt-1">{selectedDetail.receipt_number}</p>
                                            </div>
                                            <button
                                                onClick={() => setIsDetailOpen(false)}
                                                className="w-10 h-10 rounded-lg bg-white/5 border border-purple-500/20 flex items-center justify-center text-gray-400 hover:text-gray-200 hover:border-red-500/50 transition-all cursor-pointer"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>

                                        {/* Content */}
                                        <div className="p-6 overflow-y-auto flex-1 space-y-6">
                                            {/* Transaction Info */}
                                            <div className="grid grid-cols-2 gap-6 bg-white/5 border border-purple-500/10 rounded-xl p-4">
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Tanggal & Waktu</p>
                                                    <p className="text-sm text-gray-300 font-medium">
                                                        {formatDate(selectedDetail.created_at)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Nama Pelanggan</p>
                                                    <p className="text-sm text-gray-300 font-medium">{selectedDetail.customer?.name || 'Walk-in'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Kasir</p>
                                                    <p className="text-sm text-gray-300 font-medium">{selectedDetail.user?.username || '-'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Cabang</p>
                                                    <div className="flex items-center gap-1.5">
                                                        <Store className="w-3.5 h-3.5 text-purple-400" />
                                                        <p className="text-sm text-gray-300 font-medium">{selectedDetail.store?.name || '-'}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Items */}
                                            <div>
                                                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Item Terjual</h3>
                                                <div className="space-y-2">
                                                    {selectedDetail.details.map((item, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center justify-between bg-white/5 border border-purple-500/10 rounded-xl p-4 group hover:border-purple-500/30 transition-all"
                                                        >
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <p className="text-sm text-gray-200 font-medium group-hover:text-cyan-400 transition-colors">{item.item_name}</p>
                                                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${item.item_type === 'layanan'
                                                                        ? 'bg-blue-500/20 text-blue-400'
                                                                        : 'bg-purple-500/20 text-purple-400'
                                                                        }`}>
                                                                        {item.item_type === 'layanan' ? 'Layanan' : 'Produk'}
                                                                    </span>
                                                                </div>
                                                                <p className="text-xs text-gray-500">
                                                                    {formatCurrency(item.price)} x {item.quantity}
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-sm text-cyan-400 font-medium italic">{formatCurrency(item.subtotal)}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Payment Methods */}
                                            {selectedDetail.payments && selectedDetail.payments.length > 0 && (
                                                <div>
                                                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Metode Pembayaran</h3>
                                                    <div className="space-y-2">
                                                        {selectedDetail.payments.map((payment, index) => (
                                                            <div key={index} className="flex items-center justify-between bg-white/5 border border-purple-500/10 rounded-xl p-3">
                                                                <span className="text-sm text-gray-300 font-medium uppercase">{payment.method}</span>
                                                                <span className="text-sm text-green-400 font-medium">{formatCurrency(payment.amount)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Summary */}
                                            <div className="space-y-3 bg-gradient-to-br from-white/5 to-transparent border border-purple-500/20 rounded-2xl p-6">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm text-gray-400">Subtotal</p>
                                                    <p className="text-sm text-gray-300 font-medium">{formatCurrency(selectedDetail.subtotal || selectedDetail.total_amount)}</p>
                                                </div>
                                                {selectedDetail.discount > 0 && (
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-sm text-gray-400">
                                                            Diskon {selectedDetail.discount_type === 'percentage' ? `(${selectedDetail.discount}%)` : ''}
                                                        </p>
                                                        <p className="text-sm text-red-400 font-medium">
                                                            - {formatCurrency(
                                                                selectedDetail.discount_type === 'percentage'
                                                                    ? (selectedDetail.subtotal * selectedDetail.discount) / 100
                                                                    : selectedDetail.discount
                                                            )}
                                                        </p>
                                                    </div>
                                                )}
                                                <div className="border-t border-purple-500/20 pt-4 flex items-center justify-between">
                                                    <p className="text-base text-gray-200 font-bold uppercase tracking-tight">Total Akhir</p>
                                                    <p className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 font-black">
                                                        {formatCurrency(selectedDetail.total_amount)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className="p-4 md:p-6 border-t border-purple-500/20 flex flex-col sm:flex-row gap-2 md:gap-3 justify-end shrink-0">
                                            <button
                                                onClick={() => setIsDetailOpen(false)}
                                                className="w-full sm:w-auto order-4 sm:order-none px-6 py-2.5 rounded-xl border border-purple-500/30 text-gray-400 hover:text-gray-200 hover:border-purple-500/50 transition-all text-sm cursor-pointer"
                                            >
                                                Tutup
                                            </button>
                                            {userPermissions.includes('report.deletetransaction') && (
                                                <button
                                                    onClick={(e) => selectedDetail && confirmDelete(e, { id: selectedDetail.id, invoice_number: selectedDetail.receipt_number } as TransactionHistoryItem)}
                                                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-500/80 to-red-600/80 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:shadow-[0_0_30px_rgba(239,68,68,0.6)] transition-all text-sm cursor-pointer font-bold"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Hapus Transaksi
                                                </button>
                                            )}
                                            <button
                                                onClick={() => {
                                                    if (!selectedDetail?.customer?.phone) {
                                                        toast.error('Nomor telepon pelanggan tidak tersedia');
                                                        return;
                                                    }
                                                    let phone = selectedDetail.customer.phone.replace(/\D/g, '');
                                                    if (phone.startsWith('0')) {
                                                        phone = '62' + phone.substring(1);
                                                    }
                                                    const invoiceUrl = `${window.location.origin}/print-invoice/${selectedDetail.id}?cetak=false`;
                                                    const text = encodeURIComponent(`Halo ${selectedDetail.customer.name},\n\nTerima kasih telah berbelanja di ${selectedDetail.store?.name}.\n\nBerikut adalah link nota Anda:\n${invoiceUrl}\n\nTerima kasih!`);
                                                    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
                                                }}
                                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_30px_rgba(34,197,94,0.6)] transition-all text-sm cursor-pointer font-bold"
                                            >
                                                <MessageCircle className="w-4 h-4" />
                                                Kirim WhatsApp
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (selectedDetail) {
                                                        window.open(`/print-invoice/${selectedDetail.id}?cetak=true`, '_blank');
                                                    }
                                                }}
                                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all text-sm cursor-pointer font-bold"
                                            >
                                                <Download className="w-4 h-4" />
                                                Cetak Invoice
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Custom Delete Confirmation Modal */}
            <DeleteTransactionModal
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={executeDelete}
                invoiceNumber={transactionToDelete?.invoice_number || ''}
            />
        </div>
    );
}

function formatDate(dateStr: string) {
    try {
        const date = new Date(dateStr);
        return date.toLocaleString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return dateStr;
    }
}
