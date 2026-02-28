import { useState, useEffect } from 'react';
import {
    FileText,
    DollarSign,
    Receipt,
    TrendingUp,
    TrendingDown,
    Calendar,
    Download,
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

import {
    getSalesReport,
    getCashFlow,
    getSalesTable,
} from '../services/reportService';
import type {
    SalesReportItem,
    CashFlowItem,
    SalesTableItem,
} from '../services/reportService';

import { TransactionReport } from '../components/reports/TransactionReport';

type ReportCategory = 'general' | 'financial' | 'transaction';
type ReportPeriod = 'daily' | 'monthly' | 'yearly';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

const formatCompactCurrency = (value: number) => {
    if (value >= 1000000000) {
        return `Rp ${(value / 1000000000).toFixed(1)}M`; // Miliar for B in Indonesian
    } else if (value >= 1000000) {
        return `Rp ${(value / 1000000).toFixed(1)}jt`; // Juta for M in Indonesian
    } else if (value >= 1000) {
        return `Rp ${(value / 1000).toFixed(1)}rb`; // Ribu for K in Indonesian
    }
    return formatCurrency(value);
};

export function ReportsPage() {
    const [selectedCategory, setSelectedCategory] = useState<ReportCategory>('general');
    const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>('daily');

    const [salesData, setSalesData] = useState<SalesReportItem[]>([]);
    const [cashFlowData, setCashFlowData] = useState<CashFlowItem[]>([]);
    const [salesTableData, setSalesTableData] = useState<SalesTableItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (selectedCategory === 'general') {
            fetchReportData();
        }
    }, [selectedCategory, selectedPeriod]);

    const fetchReportData = async () => {
        setIsLoading(true);
        try {
            const [salesRes, cashRes, tableRes] = await Promise.all([
                getSalesReport(selectedPeriod),
                getCashFlow(selectedPeriod),
                getSalesTable(selectedPeriod),
            ]);

            if (salesRes.success) setSalesData(salesRes.data);
            if (cashRes.success) setCashFlowData(cashRes.data);
            if (tableRes.success) setSalesTableData(tableRes.data);
        } catch (error) {
            toast.error('Gagal memuat data laporan');
        } finally {
            setIsLoading(false);
        }
    };

    const getXAxisKey = () => {
        switch (selectedPeriod) {
            case 'daily':
                return 'time';
            case 'monthly':
                return 'date';
            case 'yearly':
                return 'month';
            default:
                return 'time';
        }
    };

    // Calculate totals
    const totalIncome = cashFlowData.reduce((sum, item) => sum + item.income, 0);
    const totalOutcome = cashFlowData.reduce((sum, item) => sum + item.outcome, 0);
    const estimatedProfit = totalIncome - totalOutcome;

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#1A1A24]/95 backdrop-blur-xl border border-purple-500/30 rounded-xl p-4 shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                    <p className="text-sm text-gray-400 mb-2">{payload[0].payload[getXAxisKey()]}</p>
                    <p className="text-sm text-cyan-400 font-bold">
                        Penjualan: {formatCurrency(payload[0].value)}
                    </p>
                </div>
            );
        }
        return null;
    };

    const exportToExcel = (data: any[], fileName: string) => {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan');
        XLSX.writeFile(workbook, fileName);
        toast.success(`File ${fileName} berhasil diunduh`);
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden h-full">
            {/* Header */}
            <div className="p-4 md:p-6 border-b border-purple-500/10 shrink-0">
                <div className="flex flex-col gap-4">
                    <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
                        <button
                            onClick={() => setSelectedCategory('general')}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm whitespace-nowrap transition-all ${selectedCategory === 'general'
                                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] font-bold'
                                : 'bg-white/5 border border-purple-500/20 text-gray-400 hover:text-gray-200 hover:border-blue-500/50'
                                }`}
                        >
                            <FileText className="w-4 h-4" />
                            Ringkasan Umum
                        </button>
                        <button
                            onClick={() => setSelectedCategory('financial')}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm whitespace-nowrap transition-all ${selectedCategory === 'financial'
                                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] font-bold'
                                : 'bg-white/5 border border-purple-500/20 text-gray-400 hover:text-gray-200 hover:border-blue-500/50'
                                }`}
                        >
                            <DollarSign className="w-4 h-4" />
                            Keuangan
                        </button>
                        <button
                            onClick={() => setSelectedCategory('transaction')}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm whitespace-nowrap transition-all ${selectedCategory === 'transaction'
                                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] font-bold'
                                : 'bg-white/5 border border-purple-500/20 text-gray-400 hover:text-gray-200 hover:border-blue-500/50'
                                }`}
                        >
                            <Receipt className="w-4 h-4" />
                            Riwayat Transaksi
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                <AnimatePresence mode="wait">
                    {selectedCategory === 'general' && (
                        <motion.div
                            key="general"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-4 md:p-6 space-y-6"
                        >
                            {/* Period Filter */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setSelectedPeriod('daily')}
                                    className={`px-4 py-2 rounded-xl text-sm transition-all flex items-center ${selectedPeriod === 'daily'
                                        ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] font-medium'
                                        : 'bg-white/5 border border-purple-500/20 text-gray-400 hover:text-gray-200 hover:border-purple-500/50'
                                        }`}
                                >
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Harian
                                </button>
                                <button
                                    onClick={() => setSelectedPeriod('monthly')}
                                    className={`px-4 py-2 rounded-xl text-sm transition-all flex items-center ${selectedPeriod === 'monthly'
                                        ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] font-medium'
                                        : 'bg-white/5 border border-purple-500/20 text-gray-400 hover:text-gray-200 hover:border-purple-500/50'
                                        }`}
                                >
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Bulanan
                                </button>
                                <button
                                    onClick={() => setSelectedPeriod('yearly')}
                                    className={`px-4 py-2 rounded-xl text-sm transition-all flex items-center ${selectedPeriod === 'yearly'
                                        ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] font-medium'
                                        : 'bg-white/5 border border-purple-500/20 text-gray-400 hover:text-gray-200 hover:border-purple-500/50'
                                        }`}
                                >
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Tahunan
                                </button>
                            </div>

                            {/* Sales Chart */}
                            <div className="bg-white/5 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6">
                                <div className="mb-6 flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg text-gray-200 font-bold">Grafik Penjualan</h3>
                                        <p className="text-sm text-gray-500">
                                            {selectedPeriod === 'daily' && 'Rincian penjualan untuk hari ini'}
                                            {selectedPeriod === 'monthly' && 'Rincian penjualan untuk bulan ini'}
                                            {selectedPeriod === 'yearly' && 'Rincian penjualan untuk tahun ini'}
                                        </p>
                                    </div>
                                    <TrendingUp className="w-6 h-6 text-cyan-400 opacity-50" />
                                </div>

                                <div className="h-[300px] w-full">
                                    {isLoading ? (
                                        <div className="h-full w-full flex items-center justify-center text-gray-500 italic">Memproses data...</div>
                                    ) : (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={salesData}>
                                                <defs>
                                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#8b5cf6" opacity={0.05} vertical={false} />
                                                <XAxis
                                                    dataKey={getXAxisKey()}
                                                    stroke="#6b7280"
                                                    tick={{ fill: '#9ca3af', fontSize: 11 }}
                                                    axisLine={false}
                                                    tickLine={false}
                                                    dy={10}
                                                />
                                                <YAxis
                                                    stroke="#6b7280"
                                                    tick={{ fill: '#9ca3af', fontSize: 11 }}
                                                    tickFormatter={formatCompactCurrency}
                                                    axisLine={false}
                                                    tickLine={false}
                                                    dx={-10}
                                                />
                                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#06b6d4', strokeWidth: 1 }} />
                                                <Area
                                                    type="monotone"
                                                    dataKey="sales"
                                                    stroke="#06b6d4"
                                                    strokeWidth={3}
                                                    fillOpacity={1}
                                                    fill="url(#colorSales)"
                                                    animationDuration={1500}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </div>

                            {/* Summary Cards */}
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="bg-[#121E19]/40 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                                        <TrendingUp className="w-16 h-16 text-green-400" />
                                    </div>
                                    <p className="text-sm text-gray-500 mb-1 font-medium">Total Pemasukan</p>
                                    <p className="text-2xl text-green-400 font-bold">{formatCurrency(totalIncome)}</p>
                                </div>

                                <div className="bg-[#1E1212]/40 backdrop-blur-xl border border-red-500/20 rounded-2xl p-6 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:-rotate-12 transition-transform">
                                        <TrendingDown className="w-16 h-16 text-red-400" />
                                    </div>
                                    <p className="text-sm text-gray-500 mb-1 font-medium">Total Pengeluaran</p>
                                    <p className="text-2xl text-red-400 font-bold">{formatCurrency(totalOutcome)}</p>
                                </div>

                                <div className="bg-[#12181E]/40 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 relative overflow-hidden group border-b-cyan-500/40">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                        <DollarSign className="w-16 h-16 text-cyan-400" />
                                    </div>
                                    <p className="text-sm text-gray-500 mb-1 font-medium">Estimasi Profit</p>
                                    <p className="text-2xl text-cyan-400 font-bold">{formatCurrency(estimatedProfit)}</p>
                                </div>
                            </div>

                            {/* Arus Kas Table */}
                            <div className="bg-white/5 backdrop-blur-xl border border-purple-500/10 rounded-2xl p-6 shadow-xl">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg text-gray-200 font-bold">Tabel Arus Uang</h3>
                                    <button
                                        onClick={() => exportToExcel(cashFlowData, `arus_kas_${selectedPeriod}.xlsx`)}
                                        className="text-xs bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-cyan-500/20 transition-all font-medium"
                                    >
                                        <Download className="w-3 h-3" />
                                        Ekspor Excel
                                    </button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-purple-500/10">
                                                <th className="text-left text-xs text-gray-500 pb-3 font-bold uppercase tracking-widest">Keterangan</th>
                                                <th className="text-right text-xs text-gray-500 pb-3 font-bold uppercase tracking-widest">Masuk</th>
                                                <th className="text-right text-xs text-gray-500 pb-3 font-bold uppercase tracking-widest">Keluar</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-purple-500/5">
                                            {cashFlowData.map((item) => (
                                                <tr key={item.no} className="hover:bg-white/5 transition-colors group">
                                                    <td className="py-4 text-sm text-gray-300 group-hover:text-white transition-colors capitalize font-medium">{item.description}</td>
                                                    <td className="py-4 text-right text-sm text-green-400 font-medium">
                                                        {item.income > 0 ? formatCurrency(item.income) : '-'}
                                                    </td>
                                                    <td className="py-4 text-right text-sm text-red-400 font-medium">
                                                        {item.outcome > 0 ? formatCurrency(item.outcome) : '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr className="bg-white/5 font-black italic">
                                                <td className="py-4 px-2 text-sm text-gray-200">GRAND TOTAL</td>
                                                <td className="py-4 text-right text-sm text-green-400">
                                                    {formatCurrency(totalIncome)}
                                                </td>
                                                <td className="py-4 text-right text-sm text-red-400">
                                                    {formatCurrency(totalOutcome)}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Sales Table */}
                            <div className="bg-white/5 backdrop-blur-xl border border-purple-500/10 rounded-2xl p-6 shadow-xl">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg text-gray-200 font-bold">Tabel Penjualan</h3>
                                    <button
                                        onClick={() => exportToExcel(salesTableData, `laporan_penjualan_${selectedPeriod}.xlsx`)}
                                        className="text-xs bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-cyan-500/20 transition-all font-medium"
                                    >
                                        <Download className="w-3 h-3" />
                                        Ekspor Excel
                                    </button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-purple-500/10">
                                                <th className="text-left text-xs text-gray-500 pb-3 font-bold uppercase tracking-widest">Tanggal</th>
                                                <th className="text-right text-xs text-gray-500 pb-3 font-bold uppercase tracking-widest">Laba</th>
                                                <th className="text-right text-xs text-gray-500 pb-3 font-bold uppercase tracking-widest">Omset</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-purple-500/5">
                                            {salesTableData.map((item, index) => (
                                                <tr key={index} className="hover:bg-white/5 transition-colors group">
                                                    <td className="py-4 text-sm text-gray-300 group-hover:text-white transition-colors font-medium">{item.date}</td>
                                                    <td className="py-4 text-right text-sm text-blue-400 font-medium">
                                                        {formatCurrency(item.profit)}
                                                    </td>
                                                    <td className="py-4 text-right text-sm text-cyan-400 font-medium">
                                                        {formatCurrency(item.revenue)}
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr className="bg-white/5 font-black italic">
                                                <td className="py-4 px-2 text-sm text-gray-200">TOTAL</td>
                                                <td className="py-4 text-right text-sm text-blue-400">
                                                    {formatCurrency(salesTableData.reduce((sum, item) => sum + item.profit, 0))}
                                                </td>
                                                <td className="py-4 text-right text-sm text-cyan-400">
                                                    {formatCurrency(salesTableData.reduce((sum, item) => sum + item.revenue, 0))}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {selectedCategory === 'financial' && (
                        <motion.div
                            key="financial"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="flex-1 min-h-[400px] flex items-center justify-center p-4"
                        >
                            <div className="text-center p-12 bg-white/5 border border-purple-500/10 rounded-3xl shadow-2xl relative overflow-hidden max-w-md w-full">
                                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center mx-auto mb-6 shadow-inner">
                                    <DollarSign className="w-10 h-10 text-cyan-400" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-200 mb-2">Modul Keuangan</h3>
                                <p className="text-gray-500 text-sm leading-relaxed mb-8">
                                    Fitur analisis neraca saldo, hutang, dan piutang sedang dalam tahap pengembangan akhir.
                                </p>
                                <div className="flex justify-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                                    <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse delay-150" />
                                    <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse delay-300" />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {selectedCategory === 'transaction' && (
                        <motion.div
                            key="transaction"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <TransactionReport />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
