import { useState, useEffect } from 'react';
import { Search, Download, Calendar, Eye, X, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

import { getTransactionReportData } from '../../services/reportService';
import type { TransactionItem } from '../../services/reportService';

type TransactionPeriod = 'daily' | 'monthly' | 'yearly';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

export function TransactionReport() {
    const [selectedPeriod, setSelectedPeriod] = useState<TransactionPeriod>('daily');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [transactions, setTransactions] = useState<TransactionItem[]>([]);
    const [selectedTransaction, setSelectedTransaction] = useState<TransactionItem | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchTransactions();
    }, [selectedPeriod]);

    const fetchTransactions = async () => {
        setIsLoading(true);
        try {
            const res = await getTransactionReportData();
            if (res.success) {
                setTransactions(res.data);
            }
        } catch (error) {
            toast.error('Gagal memuat data transaksi');
        } finally {
            setIsLoading(false);
        }
    };

    // Filter transactions
    const filteredTransactions = transactions.filter((transaction) => {
        const matchesSearch =
            transaction.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
            transaction.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
            transaction.cashbox.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = selectedCategory === 'all' || transaction.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    const handleViewDetail = (transaction: TransactionItem) => {
        setSelectedTransaction(transaction);
        setIsDetailOpen(true);
    };

    const handleExport = () => {
        const exportData = filteredTransactions.map((transaction) => ({
            'Nomor Invoice': transaction.invoiceNo,
            'Tanggal': transaction.date,
            'Pelanggan': transaction.customer,
            'Kasir / Cabang': transaction.cashbox,
            'Kategori': transaction.category,
            'Subtotal': transaction.subtotal,
            'Diskon': transaction.discount,
            'Total Akhir': transaction.grandTotal,
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
        XLSX.writeFile(workbook, `laporan_transaksi_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.xlsx`);
        toast.success('Laporan transaksi berhasil diekspor ke Excel');
    };

    return (
        <div className="p-4 md:p-6">
            {/* Period Filter */}
            <div className="mb-6 flex flex-wrap gap-2">
                <button
                    onClick={() => setSelectedPeriod('daily')}
                    className={`px-4 py-2 rounded-xl text-sm transition-all flex items-center ${selectedPeriod === 'daily'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                        : 'bg-white/5 border border-purple-500/20 text-gray-400 hover:text-gray-200 hover:border-purple-500/50'
                        }`}
                >
                    <Calendar className="w-4 h-4 mr-2" />
                    Harian
                </button>
                <button
                    onClick={() => setSelectedPeriod('monthly')}
                    className={`px-4 py-2 rounded-xl text-sm transition-all flex items-center ${selectedPeriod === 'monthly'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                        : 'bg-white/5 border border-purple-500/20 text-gray-400 hover:text-gray-200 hover:border-purple-500/50'
                        }`}
                >
                    <Calendar className="w-4 h-4 mr-2" />
                    Bulanan
                </button>
                <button
                    onClick={() => setSelectedPeriod('yearly')}
                    className={`px-4 py-2 rounded-xl text-sm transition-all flex items-center ${selectedPeriod === 'yearly'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                        : 'bg-white/5 border border-purple-500/20 text-gray-400 hover:text-gray-200 hover:border-purple-500/50'
                        }`}
                >
                    <Calendar className="w-4 h-4 mr-2" />
                    Tahunan
                </button>
                <div className="ml-auto">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all"
                    >
                        <Download className="w-4 h-4" />
                        Ekspor Excel
                    </button>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="mb-6 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Cari berdasarkan invoice, pelanggan, atau kasir..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-purple-500/20 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
                    />
                </div>
                <div className="w-full md:w-64">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#16161D] border border-purple-500/20 rounded-xl text-gray-200 focus:outline-none focus:border-blue-500/50"
                    >
                        <option value="all">Semua Kategori</option>
                        <option value="Produk">Produk</option>
                        <option value="Layanan">Layanan / Jasa</option>
                    </select>
                </div>
            </div>

            {/* Transaction List */}
            <div className="bg-white/5 backdrop-blur-xl border border-purple-500/20 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-white/5 border-b border-purple-500/20">
                                <th className="text-left text-sm text-gray-400 py-4 px-4 font-medium">No. Invoice</th>
                                <th className="text-left text-sm text-gray-400 py-4 px-4 font-medium">Tanggal</th>
                                <th className="text-left text-sm text-gray-400 py-4 px-4 font-medium">Pelanggan</th>
                                <th className="text-left text-sm text-gray-400 py-4 px-4 font-medium">Kasir / Cabang</th>
                                <th className="text-left text-sm text-gray-400 py-4 px-4 font-medium">Tipe</th>
                                <th className="text-right text-sm text-gray-400 py-4 px-4 font-medium">Total Akhir</th>
                                <th className="text-center text-sm text-gray-400 py-4 px-4 font-medium">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-purple-500/10">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-gray-500">Memuat data...</td>
                                </tr>
                            ) : filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-gray-500">Tidak ada transaksi ditemukan</td>
                                </tr>
                            ) : (
                                filteredTransactions.map((transaction) => (
                                    <tr
                                        key={transaction.id}
                                        className="hover:bg-white/5 transition-colors cursor-pointer"
                                        onClick={() => handleViewDetail(transaction)}
                                    >
                                        <td className="py-4 px-4">
                                            <span className="text-cyan-400 text-sm font-medium">{transaction.invoiceNo}</span>
                                        </td>
                                        <td className="py-4 px-4 text-gray-300 text-sm">
                                            {formatDate(transaction.date)}
                                        </td>
                                        <td className="py-4 px-4 text-gray-300 text-sm">{transaction.customer}</td>
                                        <td className="py-4 px-4 text-gray-300 text-sm text-ellipsis overflow-hidden whitespace-nowrap max-w-[150px]">
                                            {transaction.cashbox}
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${transaction.category === 'Layanan'
                                                ? 'bg-blue-500/20 text-blue-400'
                                                : 'bg-purple-500/20 text-purple-400'
                                                }`}>
                                                {transaction.category}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-right text-cyan-400 font-medium">
                                            {formatCurrency(transaction.grandTotal)}
                                        </td>
                                        <td className="py-4 px-4 text-center">
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
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Transaction Detail Modal */}
            <AnimatePresence>
                {isDetailOpen && selectedTransaction && (
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
                            <div className="bg-[#0F0F14]/95 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-[0_0_40px_rgba(139,92,246,0.3)] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                                {/* Header */}
                                <div className="p-6 border-b border-purple-500/20 flex items-center justify-between shrink-0">
                                    <div>
                                        <h2 className="text-xl md:text-2xl text-gray-200">Detail Transaksi</h2>
                                        <p className="text-sm text-cyan-400 mt-1">{selectedTransaction.invoiceNo}</p>
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
                                                {formatDate(selectedTransaction.date)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Nama Pelanggan</p>
                                            <p className="text-sm text-gray-300 font-medium">{selectedTransaction.customer}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Kasir / Cabang</p>
                                            <p className="text-sm text-gray-300 font-medium">{selectedTransaction.cashbox}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Kategori Utama</p>
                                            <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${selectedTransaction.category === 'Layanan'
                                                ? 'bg-blue-500/20 text-blue-400'
                                                : 'bg-purple-500/20 text-purple-400'
                                                }`}>
                                                {selectedTransaction.category}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Products */}
                                    <div>
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Item Terjual</h3>
                                        <div className="space-y-2">
                                            {selectedTransaction.items.map((item, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between bg-white/5 border border-purple-500/10 rounded-xl p-4 group hover:border-purple-500/30 transition-all"
                                                >
                                                    <div className="flex-1">
                                                        <p className="text-sm text-gray-200 font-medium group-hover:text-cyan-400 transition-colors">{item.name}</p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {formatCurrency(item.price)} x {item.qty}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm text-cyan-400 font-medium italic">{formatCurrency(item.price * item.qty)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Summary */}
                                    <div className="space-y-3 bg-gradient-to-br from-white/5 to-transparent border border-purple-500/20 rounded-2xl p-6">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-gray-400">Subtotal</p>
                                            <p className="text-sm text-gray-300 font-medium">{formatCurrency(selectedTransaction.subtotal)}</p>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-gray-400">Diskon Promosi</p>
                                            <p className="text-sm text-red-400 font-medium">
                                                {selectedTransaction.discount > 0 ? `- ${formatCurrency(selectedTransaction.discount)}` : 'Rp 0'}
                                            </p>
                                        </div>
                                        <div className="border-t border-purple-500/20 pt-4 flex items-center justify-between">
                                            <p className="text-base text-gray-200 font-bold uppercase tracking-tight">Total Akhir</p>
                                            <p className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 font-black">
                                                {formatCurrency(selectedTransaction.grandTotal)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="p-6 border-t border-purple-500/20 flex gap-3 justify-between shrink-0">
                                    <button
                                        onClick={() => {
                                            if (window.confirm(`Hapus transaksi ${selectedTransaction.invoiceNo}?`)) {
                                                toast.success(`Transaksi ${selectedTransaction.invoiceNo} berhasil dihapus`);
                                                setIsDetailOpen(false);
                                            }
                                        }}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20 transition-all text-sm cursor-pointer font-medium"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Hapus
                                    </button>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setIsDetailOpen(false)}
                                            className="px-6 py-2.5 rounded-xl border border-purple-500/30 text-gray-400 hover:text-gray-200 hover:border-purple-500/50 transition-all text-sm cursor-pointer"
                                        >
                                            Tutup
                                        </button>
                                        <button
                                            onClick={() => toast.success('Fitur cetak akan segera tersedia')}
                                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all text-sm cursor-pointer font-bold"
                                        >
                                            <Download className="w-4 h-4" />
                                            Cetak Invoice
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
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
