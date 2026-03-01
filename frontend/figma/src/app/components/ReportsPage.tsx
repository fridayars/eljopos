import { useState } from 'react';
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
import { TransactionReport } from './TransactionReport';

type ReportCategory = 'general' | 'financial' | 'transaction';
type ReportPeriod = 'daily' | 'monthly' | 'yearly';

interface Transaction {
  id: string;
  invoiceNo: string;
  date: string;
  customer: string;
  cashbox: string;
  category: string;
  items: { name: string; qty: number; price: number }[];
  subtotal: number;
  discount: number;
  grandTotal: number;
}

// Mock data for daily sales chart
const dailySalesData = [
  { time: '00:00', sales: 4500000 },
  { time: '03:00', sales: 2300000 },
  { time: '06:00', sales: 5600000 },
  { time: '09:00', sales: 12800000 },
  { time: '12:00', sales: 18500000 },
  { time: '15:00', sales: 15200000 },
  { time: '18:00', sales: 21300000 },
  { time: '21:00', sales: 14700000 },
];

// Mock data for monthly sales chart
const monthlySalesData = [
  { date: 'Jan 1', sales: 45000000 },
  { date: 'Jan 5', sales: 52000000 },
  { date: 'Jan 10', sales: 48000000 },
  { date: 'Jan 15', sales: 61000000 },
  { date: 'Jan 20', sales: 58000000 },
  { date: 'Jan 25', sales: 67000000 },
  { date: 'Jan 30', sales: 71000000 },
];

// Mock data for yearly sales chart
const yearlySalesData = [
  { month: 'Jan', sales: 450000000 },
  { month: 'Feb', sales: 520000000 },
  { month: 'Mar', sales: 580000000 },
  { month: 'Apr', sales: 610000000 },
  { month: 'May', sales: 670000000 },
  { month: 'Jun', sales: 710000000 },
  { month: 'Jul', sales: 690000000 },
  { month: 'Aug', sales: 720000000 },
  { month: 'Sep', sales: 680000000 },
  { month: 'Oct', sales: 750000000 },
  { month: 'Nov', sales: 780000000 },
  { month: 'Dec', sales: 820000000 },
];

// Mock data for cash flow table
const dailyCashFlowData = [
  { no: 1, description: 'Penjualan Produk', income: 94800000, outcome: 0 },
  { no: 2, description: 'Pembelian Stok', income: 0, outcome: 45000000 },
  { no: 3, description: 'Biaya Operasional', income: 0, outcome: 8500000 },
  { no: 4, description: 'Pembayaran Gaji', income: 0, outcome: 15000000 },
  { no: 5, description: 'Biaya Listrik & Air', income: 0, outcome: 3200000 },
];

const monthlyCashFlowData = [
  { no: 1, description: 'Penjualan Produk', income: 402000000, outcome: 0 },
  { no: 2, description: 'Pembelian Stok', income: 0, outcome: 185000000 },
  { no: 3, description: 'Biaya Operasional', income: 0, outcome: 35000000 },
  { no: 4, description: 'Pembayaran Gaji', income: 0, outcome: 65000000 },
  { no: 5, description: 'Biaya Listrik & Air', income: 0, outcome: 12000000 },
  { no: 6, description: 'Marketing & Promosi', income: 0, outcome: 15000000 },
];

const yearlyCashFlowData = [
  { no: 1, description: 'Penjualan Produk', income: 7990000000, outcome: 0 },
  { no: 2, description: 'Pembelian Stok', income: 0, outcome: 3500000000 },
  { no: 3, description: 'Biaya Operasional', income: 0, outcome: 420000000 },
  { no: 4, description: 'Pembayaran Gaji', income: 0, outcome: 780000000 },
  { no: 5, description: 'Biaya Listrik & Air', income: 0, outcome: 145000000 },
  { no: 6, description: 'Marketing & Promosi', income: 0, outcome: 180000000 },
  { no: 7, description: 'Pajak', income: 0, outcome: 650000000 },
];

// Mock data for sales table
const dailySalesTableData = [
  { date: '2026-02-23 08:00', profit: 2500000, revenue: 12400000 },
  { date: '2026-02-23 10:00', profit: 3200000, revenue: 15800000 },
  { date: '2026-02-23 12:00', profit: 4100000, revenue: 18500000 },
  { date: '2026-02-23 14:00', profit: 3800000, revenue: 16200000 },
  { date: '2026-02-23 16:00', profit: 4500000, revenue: 19300000 },
  { date: '2026-02-23 18:00', profit: 5200000, revenue: 21300000 },
];

const monthlySalesTableData = [
  { date: '2026-02-01', profit: 15200000, revenue: 45000000 },
  { date: '2026-02-05', profit: 18500000, revenue: 52000000 },
  { date: '2026-02-10', profit: 16800000, revenue: 48000000 },
  { date: '2026-02-15', profit: 21200000, revenue: 61000000 },
  { date: '2026-02-20', profit: 19800000, revenue: 58000000 },
  { date: '2026-02-25', profit: 23400000, revenue: 67000000 },
];

const yearlySalesTableData = [
  { date: 'January 2026', profit: 152000000, revenue: 450000000 },
  { date: 'February 2026', profit: 176000000, revenue: 520000000 },
  { date: 'March 2026', profit: 196000000, revenue: 580000000 },
  { date: 'April 2026', profit: 207000000, revenue: 610000000 },
  { date: 'May 2026', profit: 227000000, revenue: 670000000 },
  { date: 'June 2026', profit: 240000000, revenue: 710000000 },
  { date: 'July 2026', profit: 234000000, revenue: 690000000 },
  { date: 'August 2026', profit: 244000000, revenue: 720000000 },
  { date: 'September 2026', profit: 230000000, revenue: 680000000 },
  { date: 'October 2026', profit: 254000000, revenue: 750000000 },
  { date: 'November 2026', profit: 264000000, revenue: 780000000 },
  { date: 'December 2026', profit: 278000000, revenue: 820000000 },
];

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
    return `Rp ${(value / 1000000000).toFixed(1)}B`;
  } else if (value >= 1000000) {
    return `Rp ${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `Rp ${(value / 1000).toFixed(1)}K`;
  }
  return formatCurrency(value);
};

export function ReportsPage() {
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory>('general');
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>('daily');

  const getSalesData = () => {
    switch (selectedPeriod) {
      case 'daily':
        return dailySalesData;
      case 'monthly':
        return monthlySalesData;
      case 'yearly':
        return yearlySalesData;
      default:
        return dailySalesData;
    }
  };

  const getCashFlowData = () => {
    switch (selectedPeriod) {
      case 'daily':
        return dailyCashFlowData;
      case 'monthly':
        return monthlyCashFlowData;
      case 'yearly':
        return yearlyCashFlowData;
      default:
        return dailyCashFlowData;
    }
  };

  const getSalesTableData = () => {
    switch (selectedPeriod) {
      case 'daily':
        return dailySalesTableData;
      case 'monthly':
        return monthlySalesTableData;
      case 'yearly':
        return yearlySalesTableData;
      default:
        return dailySalesTableData;
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

  const salesData = getSalesData();
  const cashFlowData = getCashFlowData();
  const salesTableData = getSalesTableData();

  // Calculate totals
  const totalIncome = cashFlowData.reduce((sum, item) => sum + item.income, 0);
  const totalOutcome = cashFlowData.reduce((sum, item) => sum + item.outcome, 0);
  const estimatedProfit = totalIncome - totalOutcome;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1A1A24]/95 backdrop-blur-xl border border-purple-500/30 rounded-xl p-4 shadow-[0_0_20px_rgba(139,92,246,0.3)]">
          <p className="text-sm text-gray-400 mb-2">{payload[0].payload[getXAxisKey()]}</p>
          <p className="text-sm text-cyan-400">
            Sales: {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const exportToExcel = (data: any[], fileName: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-purple-500/10 shrink-0">
        <div className="flex flex-col gap-4">
          {/* Report Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
            <button
              onClick={() => setSelectedCategory('general')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm whitespace-nowrap transition-all ${
                selectedCategory === 'general'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                  : 'bg-white/5 border border-purple-500/20 text-gray-400 hover:text-gray-200 hover:border-blue-500/50'
              }`}
            >
              <FileText className="w-4 h-4" />
              General Report
            </button>
            <button
              onClick={() => setSelectedCategory('financial')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm whitespace-nowrap transition-all ${
                selectedCategory === 'financial'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                  : 'bg-white/5 border border-purple-500/20 text-gray-400 hover:text-gray-200 hover:border-blue-500/50'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              Financial Report
            </button>
            <button
              onClick={() => setSelectedCategory('transaction')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm whitespace-nowrap transition-all ${
                selectedCategory === 'transaction'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                  : 'bg-white/5 border border-purple-500/20 text-gray-400 hover:text-gray-200 hover:border-blue-500/50'
              }`}
            >
              <Receipt className="w-4 h-4" />
              Transaction Report
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {selectedCategory === 'general' && (
          <div className="p-4 md:p-6">
            {/* Period Filter */}
            <div className="mb-6 flex gap-2">
              <button
                onClick={() => setSelectedPeriod('daily')}
                className={`px-4 py-2 rounded-xl text-sm transition-all ${
                  selectedPeriod === 'daily'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                    : 'bg-white/5 border border-purple-500/20 text-gray-400 hover:text-gray-200 hover:border-purple-500/50'
                }`}
              >
                <Calendar className="w-4 h-4 inline-block mr-2" />
                Daily
              </button>
              <button
                onClick={() => setSelectedPeriod('monthly')}
                className={`px-4 py-2 rounded-xl text-sm transition-all ${
                  selectedPeriod === 'monthly'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                    : 'bg-white/5 border border-purple-500/20 text-gray-400 hover:text-gray-200 hover:border-purple-500/50'
                }`}
              >
                <Calendar className="w-4 h-4 inline-block mr-2" />
                Monthly
              </button>
              <button
                onClick={() => setSelectedPeriod('yearly')}
                className={`px-4 py-2 rounded-xl text-sm transition-all ${
                  selectedPeriod === 'yearly'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                    : 'bg-white/5 border border-purple-500/20 text-gray-400 hover:text-gray-200 hover:border-purple-500/50'
                }`}
              >
                <Calendar className="w-4 h-4 inline-block mr-2" />
                Yearly
              </button>
            </div>

            <div className="space-y-6">
              {/* Sales Chart */}
              <div className="bg-white/5 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6">
                <div className="mb-6">
                  <h3 className="text-lg text-gray-200 mb-1">Grafik Penjualan</h3>
                  <p className="text-sm text-gray-500">
                    {selectedPeriod === 'daily' && 'Sales breakdown for today'}
                    {selectedPeriod === 'monthly' && 'Sales breakdown for this month'}
                    {selectedPeriod === 'yearly' && 'Sales breakdown for this year'}
                  </p>
                </div>

                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesData}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#8b5cf6" opacity={0.1} />
                      <XAxis
                        dataKey={getXAxisKey()}
                        stroke="#9ca3af"
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                      />
                      <YAxis
                        stroke="#9ca3af"
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        tickFormatter={formatCompactCurrency}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="sales"
                        stroke="#06b6d4"
                        strokeWidth={2}
                        fill="url(#colorSales)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Income & Outcome Summary */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white/5 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6 hover:border-green-500/40 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/30 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-green-400" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">Total Pemasukan</p>
                  <p className="text-2xl text-green-400">{formatCurrency(totalIncome)}</p>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-red-500/20 rounded-2xl p-6 hover:border-red-500/40 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-rose-600/20 border border-red-500/30 flex items-center justify-center">
                      <TrendingDown className="w-6 h-6 text-red-400" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">Total Pengeluaran</p>
                  <p className="text-2xl text-red-400">{formatCurrency(totalOutcome)}</p>
                </div>
              </div>

              {/* Estimated Profit */}
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-600/10 border border-blue-500/30 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Estimasi Profit</p>
                    <p className="text-3xl text-gray-200">{formatCurrency(estimatedProfit)}</p>
                  </div>
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center">
                    <DollarSign className="w-8 h-8 text-cyan-400" />
                  </div>
                </div>
              </div>

              {/* Cash Flow Table */}
              <div className="bg-white/5 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6">
                <h3 className="text-lg text-gray-200 mb-4">Tabel Arus Uang</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-purple-500/20">
                        <th className="text-left text-sm text-gray-400 pb-3 px-4">No</th>
                        <th className="text-left text-sm text-gray-400 pb-3 px-4">Keterangan</th>
                        <th className="text-right text-sm text-gray-400 pb-3 px-4">Masuk</th>
                        <th className="text-right text-sm text-gray-400 pb-3 px-4">Keluar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cashFlowData.map((item) => (
                        <tr
                          key={item.no}
                          className="border-b border-purple-500/10 hover:bg-white/5 transition-colors"
                        >
                          <td className="py-3 px-4 text-gray-300">{item.no}</td>
                          <td className="py-3 px-4 text-gray-300">{item.description}</td>
                          <td className="py-3 px-4 text-right text-green-400">
                            {item.income > 0 ? formatCurrency(item.income) : '-'}
                          </td>
                          <td className="py-3 px-4 text-right text-red-400">
                            {item.outcome > 0 ? formatCurrency(item.outcome) : '-'}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-white/5">
                        <td className="py-3 px-4"></td>
                        <td className="py-3 px-4 text-gray-200">Total</td>
                        <td className="py-3 px-4 text-right text-green-400">
                          {formatCurrency(totalIncome)}
                        </td>
                        <td className="py-3 px-4 text-right text-red-400">
                          {formatCurrency(totalOutcome)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => exportToExcel(cashFlowData, 'cash_flow_data.xlsx')}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm whitespace-nowrap transition-all bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                  >
                    <Download className="w-4 h-4" />
                    Download Excel
                  </button>
                </div>
              </div>

              {/* Sales Table */}
              <div className="bg-white/5 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6">
                <h3 className="text-lg text-gray-200 mb-4">Tabel Penjualan</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-purple-500/20">
                        <th className="text-left text-sm text-gray-400 pb-3 px-4">Tanggal</th>
                        <th className="text-right text-sm text-gray-400 pb-3 px-4">Laba</th>
                        <th className="text-right text-sm text-gray-400 pb-3 px-4">Omset</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesTableData.map((item, index) => (
                        <tr
                          key={index}
                          className="border-b border-purple-500/10 hover:bg-white/5 transition-colors"
                        >
                          <td className="py-3 px-4 text-gray-300">{item.date}</td>
                          <td className="py-3 px-4 text-right text-blue-400">
                            {formatCurrency(item.profit)}
                          </td>
                          <td className="py-3 px-4 text-right text-cyan-400">
                            {formatCurrency(item.revenue)}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-white/5">
                        <td className="py-3 px-4 text-gray-200">Total</td>
                        <td className="py-3 px-4 text-right text-blue-400">
                          {formatCurrency(
                            salesTableData.reduce((sum, item) => sum + item.profit, 0)
                          )}
                        </td>
                        <td className="py-3 px-4 text-right text-cyan-400">
                          {formatCurrency(
                            salesTableData.reduce((sum, item) => sum + item.revenue, 0)
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => exportToExcel(salesTableData, 'sales_data.xlsx')}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm whitespace-nowrap transition-all bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                  >
                    <Download className="w-4 h-4" />
                    Download Excel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedCategory === 'financial' && (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center">
              <DollarSign className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-xl text-gray-400">Financial Report</p>
              <p className="text-sm text-gray-600 mt-2">Coming Soon</p>
            </div>
          </div>
        )}

        {selectedCategory === 'transaction' && (
          <TransactionReport />
        )}
      </div>
    </div>
  );
}