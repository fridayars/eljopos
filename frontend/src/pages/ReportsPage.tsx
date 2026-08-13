import { useState, useEffect } from 'react';
import {
    FileText,
    DollarSign,
    Receipt,
    TrendingUp,
    TrendingDown,
    Calendar,
    Download,
    Award,
    ChevronLeft,
    ChevronRight,
    X,
} from 'lucide-react';
import {
    BarChart,
    Bar,
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
    getProductRanking,
    getCustomerRanking,
    getSalesReport,
    getSummaryCards,
    getCashFlow,
    getSalesTable,
    getExpenseChart,
    getTechnicianIncentiveReport,
    getTechnicianIncentiveDetail,
} from '../services/reportService';
import type {
    SalesReportItem,
    CashFlowItem,
    SalesTableItem,
    ProductRankingItem,
    CustomerRankingItem,
    ExpenseChartItem,
    IncentiveDetailItem,
} from '../services/reportService';

import { TransactionReport } from '../components/reports/TransactionReport';
import { DateRangePicker } from '../components/ui/DateRangePicker';

type ReportCategory = 'general' | 'financial' | 'transaction' | 'rankings' | 'incentive';
type ReportPeriod = 'daily' | 'monthly' | 'yearly';
type RankingSubTab = 'product' | 'customer';

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

    const [currentStoreId] = useState<string | undefined>(() => {
        try {
            const userRaw = localStorage.getItem('user')
            if (userRaw) {
                const user = JSON.parse(userRaw)
                return user.store_id || undefined
            }
        } catch {
            // ignore
        }
        return undefined
    })

    const [selectedCategory, setSelectedCategory] = useState<ReportCategory>(() => {
        if (userPermissions.includes('report.general')) return 'general';
        if (userPermissions.includes('report.finance')) return 'financial';
        if (userPermissions.includes('report.transaction')) return 'transaction';
        return 'general'; // fallback
    });
    const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>('daily');

    const [salesData, setSalesData] = useState<SalesReportItem[]>([]);
    const [expenseChartData, setExpenseChartData] = useState<ExpenseChartItem[]>([]);
    const [cashFlowData, setCashFlowData] = useState<CashFlowItem[]>([]);
    const [salesTableData, setSalesTableData] = useState<SalesTableItem[]>([]);
    const [summaryCards, setSummaryCards] = useState({
        total_income: 0,
        total_outcome: 0,
        estimated_profit: 0
    });

    // Rankings State
    const [rankingSubTab, setRankingSubTab] = useState<RankingSubTab>('product');
    const [startDate, setStartDate] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    });
    const [endDate, setEndDate] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    });
    const [productRankings, setProductRankings] = useState<ProductRankingItem[]>([]);
    const [customerRankings, setCustomerRankings] = useState<CustomerRankingItem[]>([]);
    const [rankingPage, setRankingPage] = useState(1);
    const [rankingMeta, setRankingMeta] = useState({ total_pages: 0, total: 0 });

    // Incentive State
    const [incentiveData, setIncentiveData] = useState<{ staff_id: string; staff_name: string; total_incentive: number }[]>([]);
    const [incentiveMeta, setIncentiveMeta] = useState({ total_pages: 0, total: 0 });
    const [incentivePage, setIncentivePage] = useState(1);
    const [totalIncentive, setTotalIncentive] = useState(0);
    const [incentiveSearch, setIncentiveSearch] = useState('');
    const [selectedStaff, setSelectedStaff] = useState<{ staff_id: string; staff_name: string } | null>(null);
    const [incentiveDetail, setIncentiveDetail] = useState<IncentiveDetailItem[]>([]);
    const [isDetailLoading, setIsDetailLoading] = useState(false);

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (selectedCategory === 'general') {
            fetchReportData();
        } else if (selectedCategory === 'rankings') {
            fetchRankingData();
        }
    }, [selectedCategory, selectedPeriod, rankingSubTab, startDate, endDate, rankingPage, currentStoreId]);

    // Reset incentive state when switching into incentive tab
    useEffect(() => {
        if (selectedCategory === 'incentive') {
            setIncentiveData([]);
            setIncentiveMeta({ total_pages: 0, total: 0 });
            setIncentivePage(1);
            setTotalIncentive(0);
            setIncentiveSearch('');
        }
    }, [selectedCategory]);

    // Fetch incentive data when in incentive tab (page / date changes)
    useEffect(() => {
        if (selectedCategory === 'incentive') {
            fetchIncentiveData();
        }
    }, [selectedCategory, incentivePage, startDate, endDate, currentStoreId]);

    const fetchIncentiveData = async () => {
        setIsLoading(true);
        try {
            const res = await getTechnicianIncentiveReport({
                start_date: startDate,
                end_date: endDate,
                page: incentivePage,
                limit: 20,
                store_id: currentStoreId
            });
            if (res.success) {
                setIncentiveData(prev =>
                    incentivePage === 1 ? res.data.items : [...prev, ...res.data.items]
                );
                setIncentiveMeta({
                    total_pages: res.data.meta.total_pages,
                    total: res.data.meta.total
                });
                if (incentivePage === 1) {
                    setTotalIncentive(res.data.items.reduce((acc, cur) => acc + (cur.total_incentive || 0), 0));
                } else {
                    setTotalIncentive(prev => prev + res.data.items.reduce((acc, cur) => acc + (cur.total_incentive || 0), 0));
                }
            }
        } catch {
            toast.error('Gagal memuat data insentif');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStaffClick = async (staff: { staff_id: string; staff_name: string }) => {
        setSelectedStaff(staff);
        setIsDetailLoading(true);
        setIncentiveDetail([]);
        try {
            const res = await getTechnicianIncentiveDetail({
                staff_id: staff.staff_id,
                start_date: startDate,
                end_date: endDate,
                store_id: currentStoreId
            });
            if (res.success) {
                setIncentiveDetail(res.data);
            } else {
                toast.error(res.message || 'Gagal memuat detail insentif');
            }
        } catch {
            toast.error('Gagal memuat detail insentif');
        } finally {
            setIsDetailLoading(false);
        }
    };

    const fetchRankingData = async () => {
        setIsLoading(true);
        try {
            if (rankingSubTab === 'product') {
                const res = await getProductRanking({
                    start_date: startDate,
                    end_date: endDate,
                    page: rankingPage,
                    store_id: currentStoreId
                });
                if (res.success) {
                    setProductRankings(res.data.items);
                    setRankingMeta({
                        total_pages: res.data.meta.total_pages,
                        total: res.data.meta.total
                    });
                }
            } else {
                const res = await getCustomerRanking({
                    start_date: startDate,
                    end_date: endDate,
                    page: rankingPage,
                    store_id: currentStoreId
                });
                if (res.success) {
                    setCustomerRankings(res.data.items);
                    setRankingMeta({
                        total_pages: res.data.meta.total_pages,
                        total: res.data.meta.total
                    });
                }
            }
        } catch (error) {
            toast.error('Gagal memuat data peringkat');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchReportData = async () => {
        setIsLoading(true);
        try {
            const [salesRes, cardsRes, cashFlowRes, salesTableRes, expenseRes] = await Promise.all([
                getSalesReport({
                    start_date: startDate,
                    end_date: endDate,
                    period: selectedPeriod,
                    store_id: currentStoreId
                }),
                getSummaryCards({
                    start_date: startDate,
                    end_date: endDate,
                    store_id: currentStoreId
                }),
                getCashFlow({
                    start_date: startDate,
                    end_date: endDate,
                    store_id: currentStoreId
                }),
                getSalesTable({
                    start_date: startDate,
                    end_date: endDate,
                    period: selectedPeriod,
                    store_id: currentStoreId
                }),
                getExpenseChart({
                    start_date: startDate,
                    end_date: endDate,
                    store_id: currentStoreId
                })
            ]);

            if (salesRes.success) {
                setSalesData(salesRes.data);
            } else {
                setSalesData([]);
            }

            if (expenseRes.success) {
                setExpenseChartData(expenseRes.data);
            } else {
                setExpenseChartData([]);
            }

            if (cardsRes.success) {
                setSummaryCards(cardsRes.data);
            } else {
                setSummaryCards({ total_income: 0, total_outcome: 0, estimated_profit: 0 });
            }

            if (cashFlowRes.success) {
                setCashFlowData(cashFlowRes.data);
            } else {
                setCashFlowData([]);
            }

            if (salesTableRes.success) {
                setSalesTableData(salesTableRes.data);
            } else {
                setSalesTableData([]);
            }
        } catch (error) {
            toast.error('Gagal memuat data laporan');
        } finally {
            setIsLoading(false);
        }
    };

    const getXAxisKey = () => {
        return 'label';
    };

    // Calculate totals from summaryCards
    const totalIncome = summaryCards.total_income;
    const totalOutcome = summaryCards.total_outcome;
    const estimatedProfit = summaryCards.estimated_profit;

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
                    <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
                        {userPermissions.includes('report.general') && (
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
                        )}
                        {userPermissions.includes('report.finance') && (
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
                        )}
                        {userPermissions.includes('report.transaction') && (
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
                        )}
                        {true && ( // Assuming permissions for simplicity, or check for specific permission if exists
                            <button
                                onClick={() => setSelectedCategory('rankings')}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm whitespace-nowrap transition-all ${selectedCategory === 'rankings'
                                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] font-bold'
                                    : 'bg-white/5 border border-purple-500/20 text-gray-400 hover:text-gray-200 hover:border-blue-500/50'
                                    }`}
                            >
                                <Award className="w-4 h-4" />
                                Laporan Peringkat
                            </button>
                        )}
                        {userPermissions.includes('report.incentive') && (
                            <button
                                onClick={() => setSelectedCategory('incentive')}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm whitespace-nowrap transition-all ${selectedCategory === 'incentive'
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] font-bold'
                                    : 'bg-white/5 border border-purple-500/20 text-gray-400 hover:text-gray-200 hover:border-emerald-500/50'
                                    }`}
                            >
                                <DollarSign className="w-4 h-4" />
                                Laporan Insentif
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                <AnimatePresence mode="wait">
                    {selectedCategory === 'general' && userPermissions.includes('report.general') && (
                        <motion.div
                            key="general"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-4 md:p-6 space-y-6"
                        >
                            {/* Filters Bar */}
                            <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
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

                                {/* Date Range Picker */}
                                <div className="flex items-center gap-2">
                                    <DateRangePicker
                                        startDate={startDate}
                                        endDate={endDate}
                                        onDateChange={(start, end) => {
                                            setStartDate(start);
                                            setEndDate(end);
                                        }}
                                        align="right"
                                    />
                                </div>
                            </div>

                            {/* Sales Chart */}
                            <div className="bg-white/5 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6">
                                <div className="mb-6 flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg text-gray-200 font-bold">Grafik Penjualan</h3>
                                        <p className="text-sm text-gray-500">
                                            {selectedPeriod === 'daily' && 'Rincian penjualan harian untuk periode ini'}
                                            {selectedPeriod === 'monthly' && 'Rincian penjualan bulanan untuk periode ini'}
                                            {selectedPeriod === 'yearly' && 'Rincian penjualan tahunan untuk periode ini'}
                                        </p>
                                    </div>
                                    <TrendingUp className="w-6 h-6 text-cyan-400 opacity-50" />
                                </div>

                                <div className="h-[300px] w-full">
                                    {isLoading ? (
                                        <div className="h-full w-full flex items-center justify-center text-gray-500 italic">Memproses data...</div>
                                    ) : (
                                        <ResponsiveContainer width="100%" height="100%" minHeight={300} minWidth={100}>
                                            <BarChart data={salesData}>
                                                <defs>
                                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.8} />
                                                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.3} />
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
                                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
                                                <Bar
                                                    dataKey="sales"
                                                    fill="url(#colorSales)"
                                                    radius={[6, 6, 0, 0]}
                                                    animationDuration={1500}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </div>

                            {/* Expense Chart */}
                            <div className="bg-white/5 backdrop-blur-xl border border-red-500/20 rounded-2xl p-6 mt-6 mb-6">
                                <div className="mb-6 flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg text-gray-200 font-bold">Grafik Pengeluaran</h3>
                                        <p className="text-sm text-gray-500">
                                            Persentase pengeluaran berdasarkan kategori
                                        </p>
                                    </div>
                                    <TrendingDown className="w-6 h-6 text-red-400 opacity-50" />
                                </div>
                                <div className="space-y-4">
                                    {isLoading ? (
                                        <div className="flex items-center justify-center text-gray-500 italic py-10">Memproses data...</div>
                                    ) : expenseChartData.length === 0 ? (
                                        <div className="flex items-center justify-center text-gray-500 italic py-10">Tidak ada pengeluaran</div>
                                    ) : (
                                        expenseChartData.map((item, index) => (
                                            <div key={index} className="relative group">
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="text-gray-300 font-medium">{item.category} ({item.count})</span>
                                                    <span className="text-gray-400 font-bold">{item.percentage}% ({formatCurrency(item.total)})</span>
                                                </div>
                                                <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden">
                                                    <div
                                                        className="bg-gradient-to-r from-red-500 to-pink-600 h-full rounded-full transition-all duration-1000 ease-out"
                                                        style={{ width: `${item.percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))
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
                                                    <td className="py-4 text-sm text-gray-300 group-hover:text-white transition-colors capitalize font-medium whitespace-pre-line leading-relaxed">{item.description}</td>
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

                    {selectedCategory === 'financial' && userPermissions.includes('report.finance') && (
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

                    {selectedCategory === 'transaction' && userPermissions.includes('report.transaction') && (
                        <motion.div
                            key="transaction"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <TransactionReport />
                        </motion.div>
                    )}

                    {selectedCategory === 'rankings' && (
                        <motion.div
                            key="rankings"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="p-4 md:p-6 space-y-6"
                        >
                            {/* Ranking Sub-tabs and Date Filter */}
                            <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => { setRankingSubTab('product'); setRankingPage(1); }}
                                        className={`px-4 py-2 rounded-xl text-sm transition-all flex items-center ${rankingSubTab === 'product'
                                            ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] font-medium'
                                            : 'bg-white/5 border border-purple-500/20 text-gray-400 hover:text-gray-200 hover:border-blue-500/50'
                                            }`}
                                    >
                                        Peringkat Produk
                                    </button>
                                    <button
                                        onClick={() => { setRankingSubTab('customer'); setRankingPage(1); }}
                                        className={`px-4 py-2 rounded-xl text-sm transition-all flex items-center ${rankingSubTab === 'customer'
                                            ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] font-medium'
                                            : 'bg-white/5 border border-purple-500/20 text-gray-400 hover:text-gray-200 hover:border-blue-500/50'
                                            }`}
                                    >
                                        Peringkat Customer
                                    </button>
                                </div>

                                <div className="flex items-center gap-2">
                                    <DateRangePicker
                                        startDate={startDate}
                                        endDate={endDate}
                                        onDateChange={(start, end) => {
                                            setStartDate(start);
                                            setEndDate(end);
                                            setRankingPage(1);
                                        }}
                                        align="right"
                                    />
                                </div>
                            </div>

                            {/* Ranking Content */}
                            <div className="bg-white/5 backdrop-blur-xl border border-purple-500/10 rounded-2xl p-6 shadow-xl">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg text-gray-200 font-bold">
                                        {rankingSubTab === 'product' ? 'Tabel Peringkat Produk' : 'Tabel Peringkat Customer'}
                                    </h3>
                                    <p className="text-sm text-gray-500 italic">Total: {rankingMeta.total} data</p>
                                </div>
                                <div className="overflow-x-auto min-h-[300px]">
                                    {isLoading ? (
                                        <div className="h-[300px] flex items-center justify-center text-gray-500 italic">Memproses data...</div>
                                    ) : (
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-purple-500/10">
                                                    <th className="text-left text-xs text-gray-500 pb-3 font-bold uppercase tracking-widest">#</th>
                                                    <th className="text-left text-xs text-gray-500 pb-3 font-bold uppercase tracking-widest">{rankingSubTab === 'product' ? 'Nama Produk' : 'Nama Customer'}</th>
                                                    <th className="text-right text-xs text-gray-500 pb-3 font-bold uppercase tracking-widest">{rankingSubTab === 'product' ? 'Total Kuantitas' : 'Total Transaksi'}</th>
                                                    <th className="text-right text-xs text-gray-500 pb-3 font-bold uppercase tracking-widest">Total Nilai</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-purple-500/5">
                                                {rankingSubTab === 'product' ? (
                                                    productRankings.length > 0 ? (
                                                        productRankings.map((item, index) => (
                                                            <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                                                                <td className="py-4 text-sm text-gray-500">{(rankingPage - 1) * 20 + index + 1}</td>
                                                                <td className="py-4 text-sm text-gray-300 group-hover:text-white transition-colors font-medium">{item.name}</td>
                                                                <td className="py-4 text-right text-sm text-cyan-400 font-medium">{item.total_qty}</td>
                                                                <td className="py-4 text-right text-sm text-green-400 font-medium">{formatCurrency(item.total_value)}</td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr><td colSpan={4} className="py-8 text-center text-gray-500 italic">Tidak ada data untuk periode ini</td></tr>
                                                    )
                                                ) : (
                                                    customerRankings.length > 0 ? (
                                                        customerRankings.map((item, index) => (
                                                            <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                                                                <td className="py-4 text-sm text-gray-500">{(rankingPage - 1) * 20 + index + 1}</td>
                                                                <td className="py-4 text-sm text-gray-300 group-hover:text-white transition-colors font-medium">{item.name}</td>
                                                                <td className="py-4 text-right text-sm text-cyan-400 font-medium">{item.total_transactions}</td>
                                                                <td className="py-4 text-right text-sm text-green-400 font-medium">{formatCurrency(item.total_value)}</td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr><td colSpan={4} className="py-8 text-center text-gray-500 italic">Tidak ada data untuk periode ini</td></tr>
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    )}
                                </div>

                                {/* Pagination Controls */}
                                {!isLoading && rankingMeta.total_pages > 1 && (
                                    <div className="mt-8 flex items-center justify-between border-t border-purple-500/10 pt-6">
                                        <p className="text-xs text-gray-500 italic">
                                            Menampilkan Halaman <span className="text-gray-300 font-bold">{rankingPage}</span> dari <span className="text-gray-300 font-bold">{rankingMeta.total_pages}</span>
                                        </p>
                                        <div className="flex gap-2">
                                            <button
                                                disabled={rankingPage === 1}
                                                onClick={() => setRankingPage(prev => prev - 1)}
                                                className="p-2 rounded-lg bg-white/5 border border-purple-500/20 text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed hover:text-white transition-all"
                                            >
                                                <ChevronLeft className="w-5 h-5" />
                                            </button>
                                            <button
                                                disabled={rankingPage === rankingMeta.total_pages}
                                                onClick={() => setRankingPage(prev => prev + 1)}
                                                className="p-2 rounded-lg bg-white/5 border border-purple-500/20 text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed hover:text-white transition-all"
                                            >
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {selectedCategory === 'incentive' && userPermissions.includes('report.incentive') && (
                        <motion.div
                            key="incentive"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="p-4 md:p-6 space-y-6"
                        >
                            {/* Filter Bar */}
                            <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
                                {/* Search */}
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Cari nama teknisi..."
                                        value={incentiveSearch}
                                        onChange={e => setIncentiveSearch(e.target.value)}
                                        className="pl-4 pr-4 py-2 rounded-xl bg-white/5 border border-purple-500/20 text-gray-300 placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 text-sm w-56"
                                    />
                                </div>
                                {/* Date Picker */}
                                <div className="flex items-center gap-2">
                                    <DateRangePicker
                                        startDate={startDate}
                                        endDate={endDate}
                                        onDateChange={(start, end) => {
                                            setStartDate(start);
                                            setEndDate(end);
                                            setIncentivePage(1);
                                            setIncentiveData([]);
                                            setTotalIncentive(0);
                                        }}
                                        align="right"
                                    />
                                </div>
                            </div>

                            {/* Total Insentif Card */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gradient-to-br from-emerald-900/30 to-teal-900/30 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6">
                                    <p className="text-xs text-emerald-400 uppercase tracking-widest font-bold mb-1">Total Insentif Teknisi</p>
                                    <p className="text-2xl text-white font-bold">{formatCurrency(totalIncentive)}</p>
                                    <p className="text-xs text-gray-500 mt-1">Periode {startDate} s/d {endDate}</p>
                                </div>
                                <div className="bg-white/5 backdrop-blur-xl border border-purple-500/10 rounded-2xl p-6">
                                    <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Jumlah Teknisi</p>
                                    <p className="text-2xl text-white font-bold">{incentiveMeta.total}</p>
                                    <p className="text-xs text-gray-500 mt-1">Teknisi aktif dalam periode ini</p>
                                </div>
                            </div>

                            {/* Incentive Table */}
                            <div className="bg-white/5 backdrop-blur-xl border border-purple-500/10 rounded-2xl p-6 shadow-xl">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg text-gray-200 font-bold">Tabel Insentif Teknisi</h3>
                                    <p className="text-sm text-gray-500 italic">Total: {incentiveMeta.total} teknisi</p>
                                </div>
                                <div className="overflow-x-auto min-h-[200px]">
                                    {isLoading && incentiveData.length === 0 ? (
                                        <div className="h-[200px] flex items-center justify-center text-gray-500 italic">Memproses data...</div>
                                    ) : (
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-purple-500/10">
                                                    <th className="text-left text-xs text-gray-500 pb-3 font-bold uppercase tracking-widest">#</th>
                                                    <th className="text-left text-xs text-gray-500 pb-3 font-bold uppercase tracking-widest">Nama Teknisi</th>
                                                    <th className="text-right text-xs text-gray-500 pb-3 font-bold uppercase tracking-widest">Total Insentif</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-purple-500/5">
                                                {incentiveData
                                                    .filter(item => item.staff_name?.toLowerCase().includes(incentiveSearch.toLowerCase()))
                                                    .map((item, index) => (
                                                        <tr key={item.staff_id} onClick={() => handleStaffClick(item)} className="hover:bg-white/5 transition-colors group cursor-pointer">
                                                            <td className="py-4 text-sm text-gray-500">{index + 1}</td>
                                                            <td className="py-4 text-sm text-gray-300 group-hover:text-white transition-colors font-medium">{item.staff_name || '-'}</td>
                                                            <td className="py-4 text-right text-sm text-emerald-400 font-medium">{formatCurrency(item.total_incentive)}</td>
                                                        </tr>
                                                    ))
                                                }
                                                {incentiveData.filter(item => item.staff_name?.toLowerCase().includes(incentiveSearch.toLowerCase())).length === 0 && !isLoading && (
                                                    <tr><td colSpan={3} className="py-8 text-center text-gray-500 italic">Tidak ada data untuk periode ini</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    )}
                                    {/* Infinite scroll sentinel */}
                                    {!isLoading && incentivePage < incentiveMeta.total_pages && (
                                        <div className="flex justify-center py-4">
                                            <button
                                                onClick={() => setIncentivePage(p => p + 1)}
                                                className="px-6 py-2 rounded-xl bg-white/5 border border-purple-500/20 text-gray-400 hover:text-white hover:border-emerald-500/50 transition-all text-sm"
                                            >
                                                Muat lebih banyak
                                            </button>
                                        </div>
                                    )}
                                    {isLoading && incentiveData.length > 0 && (
                                        <div className="flex items-center justify-center py-4 text-gray-500 italic text-sm">Memuat data...</div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Incentive Detail Modal */}
            <AnimatePresence>
                {selectedStaff && (
                    <motion.div
                        key="incentive-detail-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={() => setSelectedStaff(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="bg-[#0d0d1a] border border-purple-500/20 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-5 border-b border-purple-500/10 shrink-0">
                                <div>
                                    <h3 className="text-lg text-white font-bold">Detail Insentif</h3>
                                    <p className="text-sm text-gray-400 mt-0.5">{selectedStaff.staff_name} — Periode {startDate} s/d {endDate}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedStaff(null)}
                                    className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="overflow-y-auto flex-1 p-5">
                                {isDetailLoading ? (
                                    <div className="flex items-center justify-center py-16 text-gray-500 italic">Memuat detail...</div>
                                ) : incentiveDetail.length === 0 ? (
                                    <div className="flex items-center justify-center py-16 text-gray-500 italic">Tidak ada data transaksi</div>
                                ) : (() => {
                                    // Group items by receipt_number
                                    const grouped = incentiveDetail.reduce<Record<string, typeof incentiveDetail>>((acc, item) => {
                                        const key = item.receipt_number || '-';
                                        if (!acc[key]) acc[key] = [];
                                        acc[key].push(item);
                                        return acc;
                                    }, {});

                                    return (
                                        <div className="space-y-3">
                                            {Object.entries(grouped).map(([invoice, rows]) => {
                                                const cardTotal = rows.reduce((a, r) => a + (r.insentif_per_item * r.quantity), 0);
                                                const txDate = new Date(rows[0].transaction_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
                                                return (
                                                    <div key={invoice} className="bg-white/5 border border-purple-500/10 rounded-xl p-4 hover:border-purple-500/25 transition-colors">
                                                        {/* Card Header */}
                                                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-purple-500/10">
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-sm text-cyan-400 font-mono font-medium">{invoice}</span>
                                                                <span className="text-xs text-gray-500">{txDate}</span>
                                                            </div>
                                                            <span className="text-sm text-emerald-400 font-bold">{formatCurrency(cardTotal)}</span>
                                                        </div>
                                                        {/* Item list */}
                                                        <div className="space-y-1.5">
                                                            {rows.map((row, idx) => (
                                                                <div key={idx} className="flex items-center justify-between text-sm">
                                                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                                                        <span className="text-gray-300 truncate">{row.item_name}</span>
                                                                        <span className="text-xs text-gray-500 shrink-0">×{row.quantity}</span>
                                                                    </div>
                                                                    <span className="text-emerald-400/80 font-medium shrink-0 ml-3">{formatCurrency(row.insentif_per_item)}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            {/* Grand Total */}
                                            <div className="bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between">
                                                <span className="text-sm text-gray-400 font-bold">Grand Total ({Object.keys(grouped).length} invoice)</span>
                                                <span className="text-lg text-emerald-400 font-bold">{formatCurrency(incentiveDetail.reduce((a, r) => a + (r.insentif_per_item * r.quantity), 0))}</span>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
