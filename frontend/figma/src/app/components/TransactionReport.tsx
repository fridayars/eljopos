import { useState } from 'react';
import { Search, Download, Calendar, Eye, X, Filter, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

type TransactionPeriod = 'daily' | 'monthly' | 'yearly';

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

// Mock transaction data
const mockTransactions: Transaction[] = [
  {
    id: '1',
    invoiceNo: 'INV-2026-0001',
    date: '2026-02-23 09:15:00',
    customer: 'John Doe',
    cashbox: 'Cashbox 1 - Main Counter',
    category: 'beverages',
    items: [
      { name: 'Premium Coffee', qty: 2, price: 35000 },
      { name: 'Butter Croissant', qty: 1, price: 28000 },
    ],
    subtotal: 98000,
    discount: 5000,
    grandTotal: 93000,
  },
  {
    id: '2',
    invoiceNo: 'INV-2026-0002',
    date: '2026-02-23 10:30:00',
    customer: 'Jane Smith',
    cashbox: 'Cashbox 1 - Main Counter',
    category: 'meals',
    items: [
      { name: 'Club Sandwich', qty: 1, price: 45000 },
      { name: 'Berry Smoothie', qty: 1, price: 32000 },
      { name: 'Premium Coffee', qty: 1, price: 35000 },
    ],
    subtotal: 112000,
    discount: 10000,
    grandTotal: 102000,
  },
  {
    id: '3',
    invoiceNo: 'INV-2026-0003',
    date: '2026-02-23 11:45:00',
    customer: 'Walk-in Customer',
    cashbox: 'Cashbox 2 - Second Floor',
    category: 'pastries',
    items: [
      { name: 'Chocolate Cake', qty: 2, price: 38000 },
      { name: 'Green Tea', qty: 2, price: 25000 },
    ],
    subtotal: 126000,
    discount: 0,
    grandTotal: 126000,
  },
  {
    id: '4',
    invoiceNo: 'INV-2026-0004',
    date: '2026-02-23 13:20:00',
    customer: 'Michael Brown',
    cashbox: 'Cashbox 1 - Main Counter',
    category: 'meals',
    items: [
      { name: 'Beef Burger', qty: 2, price: 48000 },
      { name: 'Fresh Salad Bowl', qty: 1, price: 35000 },
      { name: 'Premium Coffee', qty: 2, price: 35000 },
    ],
    subtotal: 201000,
    discount: 15000,
    grandTotal: 186000,
  },
  {
    id: '5',
    invoiceNo: 'INV-2026-0005',
    date: '2026-02-23 14:50:00',
    customer: 'Sarah Johnson',
    cashbox: 'Cashbox 3 - Terrace',
    category: 'beverages',
    items: [
      { name: 'Premium Coffee', qty: 3, price: 35000 },
      { name: 'Butter Croissant', qty: 3, price: 28000 },
      { name: 'Chocolate Cake', qty: 1, price: 38000 },
    ],
    subtotal: 227000,
    discount: 20000,
    grandTotal: 207000,
  },
  {
    id: '6',
    invoiceNo: 'INV-2026-0006',
    date: '2026-02-23 16:10:00',
    customer: 'David Wilson',
    cashbox: 'Cashbox 1 - Main Counter',
    category: 'healthy',
    items: [
      { name: 'Fresh Salad Bowl', qty: 2, price: 35000 },
      { name: 'Berry Smoothie', qty: 2, price: 32000 },
    ],
    subtotal: 134000,
    discount: 0,
    grandTotal: 134000,
  },
  {
    id: '7',
    invoiceNo: 'INV-2026-0007',
    date: '2026-02-23 17:25:00',
    customer: 'Emily Davis',
    cashbox: 'Cashbox 2 - Second Floor',
    category: 'desserts',
    items: [
      { name: 'Chocolate Cake', qty: 1, price: 38000 },
      { name: 'Premium Coffee', qty: 1, price: 35000 },
    ],
    subtotal: 73000,
    discount: 5000,
    grandTotal: 68000,
  },
  {
    id: '8',
    invoiceNo: 'INV-2026-0008',
    date: '2026-02-23 18:40:00',
    customer: 'Robert Taylor',
    cashbox: 'Cashbox 1 - Main Counter',
    category: 'meals',
    items: [
      { name: 'Club Sandwich', qty: 2, price: 45000 },
      { name: 'Beef Burger', qty: 1, price: 48000 },
      { name: 'Premium Coffee', qty: 3, price: 35000 },
    ],
    subtotal: 243000,
    discount: 25000,
    grandTotal: 218000,
  },
];

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
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Filter transactions
  const filteredTransactions = mockTransactions.filter((transaction) => {
    const matchesSearch =
      transaction.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.cashbox.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || transaction.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleViewDetail = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDetailOpen(true);
  };

  const handleExport = () => {
    const exportData = filteredTransactions.map((transaction) => ({
      'Invoice No': transaction.invoiceNo,
      'Date': transaction.date,
      'Customer': transaction.customer,
      'Cashbox': transaction.cashbox,
      'Category': transaction.category,
      'Subtotal': transaction.subtotal,
      'Discount': transaction.discount,
      'Grand Total': transaction.grandTotal,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
    XLSX.writeFile(workbook, `transaction_report_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Transaction report exported successfully');
  };

  return (
    <div className="p-4 md:p-6">
      {/* Period Filter */}
      <div className="mb-6 flex flex-wrap gap-2">
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
        <div className="ml-auto">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search by invoice, customer, or cashbox..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-purple-500/20 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
          />
        </div>
        <div className="w-full md:w-64">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2.5 bg-white/5 border border-purple-500/20 rounded-xl text-gray-200 focus:outline-none focus:border-blue-500/50"
          >
            <option value="all">All Categories</option>
            <option value="beverages">Beverages</option>
            <option value="pastries">Pastries</option>
            <option value="meals">Meals</option>
            <option value="desserts">Desserts</option>
            <option value="healthy">Healthy</option>
          </select>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-white/5 backdrop-blur-xl border border-purple-500/20 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white/5 border-b border-purple-500/20">
                <th className="text-left text-sm text-gray-400 py-4 px-4">Invoice No</th>
                <th className="text-left text-sm text-gray-400 py-4 px-4">Date</th>
                <th className="text-left text-sm text-gray-400 py-4 px-4">Customer</th>
                <th className="text-left text-sm text-gray-400 py-4 px-4">Cashbox</th>
                <th className="text-left text-sm text-gray-400 py-4 px-4">Category</th>
                <th className="text-right text-sm text-gray-400 py-4 px-4">Grand Total</th>
                <th className="text-center text-sm text-gray-400 py-4 px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="border-b border-purple-500/10 hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => handleViewDetail(transaction)}
                >
                  <td className="py-4 px-4">
                    <span className="text-cyan-400 text-sm">{transaction.invoiceNo}</span>
                  </td>
                  <td className="py-4 px-4 text-gray-300 text-sm">
                    {new Date(transaction.date).toLocaleString('id-ID')}
                  </td>
                  <td className="py-4 px-4 text-gray-300 text-sm">{transaction.customer}</td>
                  <td className="py-4 px-4 text-gray-300 text-sm">{transaction.cashbox}</td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-xs capitalize">
                      {transaction.category}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right text-cyan-400">
                    {formatCurrency(transaction.grandTotal)}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetail(transaction);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 hover:bg-cyan-500/30 transition-all text-xs"
                    >
                      <Eye className="w-3 h-3" />
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No transactions found</p>
          </div>
        )}
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
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-[#0F0F14]/95 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-[0_0_40px_rgba(139,92,246,0.3)] w-full max-w-2xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-purple-500/20 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl md:text-2xl text-gray-200">Transaction Detail</h2>
                    <p className="text-sm text-cyan-400 mt-1">{selectedTransaction.invoiceNo}</p>
                  </div>
                  <button
                    onClick={() => setIsDetailOpen(false)}
                    className="w-10 h-10 rounded-lg bg-white/5 border border-purple-500/20 flex items-center justify-center text-gray-400 hover:text-gray-200 hover:border-red-500/50 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                  {/* Transaction Info */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Date</p>
                      <p className="text-sm text-gray-300">
                        {new Date(selectedTransaction.date).toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Customer</p>
                      <p className="text-sm text-gray-300">{selectedTransaction.customer}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Cashbox</p>
                      <p className="text-sm text-gray-300">{selectedTransaction.cashbox}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Category</p>
                      <span className="inline-block px-2 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-xs capitalize">
                        {selectedTransaction.category}
                      </span>
                    </div>
                  </div>

                  {/* Products */}
                  <div className="mb-6">
                    <h3 className="text-sm text-gray-400 mb-3">Products</h3>
                    <div className="space-y-2">
                      {selectedTransaction.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-white/5 border border-purple-500/20 rounded-lg p-3"
                        >
                          <div className="flex-1">
                            <p className="text-sm text-gray-200">{item.name}</p>
                            <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-300">{formatCurrency(item.price)}</p>
                            <p className="text-xs text-cyan-400">{formatCurrency(item.price * item.qty)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="space-y-3 bg-white/5 border border-purple-500/20 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-400">Subtotal</p>
                      <p className="text-sm text-gray-300">{formatCurrency(selectedTransaction.subtotal)}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-400">Discount</p>
                      <p className="text-sm text-red-400">
                        {selectedTransaction.discount > 0 ? `- ${formatCurrency(selectedTransaction.discount)}` : '-'}
                      </p>
                    </div>
                    <div className="border-t border-purple-500/20 pt-3 flex items-center justify-between">
                      <p className="text-base text-gray-200">Grand Total</p>
                      <p className="text-xl text-cyan-400">{formatCurrency(selectedTransaction.grandTotal)}</p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-purple-500/20 flex gap-3 justify-between">
                  {/* Delete Button - Left Side */}
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete transaction ${selectedTransaction.invoiceNo}?`)) {
                        toast.success(`Transaction ${selectedTransaction.invoiceNo} deleted successfully`);
                        setIsDetailOpen(false);
                      }
                    }}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                    Delete
                  </button>

                  {/* Right Side Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsDetailOpen(false)}
                      className="px-6 py-3 rounded-xl border border-purple-500/30 text-gray-400 hover:text-gray-200 hover:border-purple-500/50 transition-all"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        toast.success('Print feature coming soon');
                      }}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all"
                    >
                      <Download className="w-5 h-5" />
                      Print Invoice
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