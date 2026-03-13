import { useState, useEffect, useCallback } from 'react';
import { Search, History as HistoryIcon, Calendar, TrendingUp, TrendingDown, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getStockMutations } from '../../services/productService';
import type { StockMutation } from '../../services/productService';

export function StockMutationsTab() {
  const [mutations, setMutations] = useState<StockMutation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const pageSize = 10;

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getStockMutations(undefined, {
        page: currentPage,
        limit: pageSize,
        search: searchQuery || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      if (res.success) {
        setMutations(res.data.items);
        setTotalPages(res.data.pagination.total_pages);
      }
    } catch (error) {
      console.error('Failed to fetch stock history:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, startDate, endDate]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxVisible - 1);
      
      if (end === totalPages) {
        start = Math.max(1, end - maxVisible + 1);
      }
      
      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  };

  const resetFilters = () => {
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full">
      {/* Filter Area */}
      <div className="p-4 md:p-6 border-b border-purple-500/10 shrink-0 bg-black/5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full relative">
              <label className="text-xs text-gray-500 mb-1.5 block">Cari Produk</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Nama produk atau SKU..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 bg-white/5 border border-purple-500/20 rounded-xl text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all font-light"
                />
              </div>
            </div>

            <div className="w-full md:w-44">
              <label className="text-xs text-gray-500 mb-1.5 block">Dari Tanggal</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-white/5 border border-purple-500/20 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-blue-500/50 transition-all"
              />
            </div>

            <div className="w-full md:w-44">
              <label className="text-xs text-gray-500 mb-1.5 block">Sampai Tanggal</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-white/5 border border-purple-500/20 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-blue-500/50 transition-all"
              />
            </div>

            {(searchQuery || startDate || endDate) && (
              <button
                onClick={resetFilters}
                className="p-2 px-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all text-sm flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content / Table */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6">
        <div className="border border-purple-500/20 rounded-2xl overflow-hidden shadow-2xl" style={{ background: 'var(--card)' }}>
          <div className="overflow-x-auto text-xs md:text-sm">
            <table className="w-full text-left border-collapse">
              <thead className="border-b border-purple-500/20" style={{ background: 'var(--surface-overlay-header)' }}>
                <tr>
                  <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider">Waktu</th>
                  <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider">Produk</th>
                  <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider">Tipe</th>
                  <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider text-right">Jumlah</th>
                  <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-500/10">
                <AnimatePresence mode="popLayout">
                  {isLoading ? (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <td colSpan={5} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className="w-10 h-10 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
                          <p className="text-gray-500">Memuat data...</p>
                        </div>
                      </td>
                    </motion.tr>
                  ) : mutations.length === 0 ? (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <td colSpan={5} className="px-6 py-20 text-center text-gray-500">
                        <HistoryIcon className="w-12 h-12 mx-auto mb-4 opacity-10" />
                        <p>Belum ada riwayat mutasi stok ditemukan</p>
                      </td>
                    </motion.tr>
                  ) : (
                    mutations.map((mutation) => {
                      const isPositive = mutation.stok > 0;
                      const mutasiType = mutation.jenis_mutasi;

                      let uiType: 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER' = 'ADJUSTMENT';
                      if (['PENAMBAHAN_STOK', 'IMPORT_DATA', 'HAPUS_TRANSAKSI'].includes(mutasiType)) uiType = 'IN';
                      else if (['PENGURANGAN_STOK', 'PENJUALAN'].includes(mutasiType)) uiType = 'OUT';
                      else if (mutasiType === 'TRANSFER_STOK') uiType = 'TRANSFER';

                      return (
                        <motion.tr
                          key={mutation.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="hover:bg-white/[0.02] transition-colors group"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-600 group-hover:text-purple-500/50 transition-colors" />
                              {formatDate(mutation.created_at)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-gray-200 font-medium break-words">{(mutation as any).product_name}</span>
                              <span className="text-[10px] text-gray-500 font-mono uppercase">{(mutation as any).product_sku}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${uiType === 'IN' ? 'bg-green-500/10 text-green-400' :
                              uiType === 'OUT' ? 'bg-red-500/10 text-red-400' :
                                uiType === 'TRANSFER' ? 'bg-blue-500/10 text-blue-400' :
                                  'bg-orange-500/10 text-orange-400'
                              }`}>
                              {mutasiType.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap font-medium text-right ${isPositive ? 'text-green-400' : 'text-red-400'
                            }`}>
                            <div className="flex items-center justify-end gap-1">
                              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                              {isPositive ? '+' : ''}{mutation.stok}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-400 max-w-xs truncate font-light">
                            {mutation.keterangan || '-'}
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="p-4 border-t border-purple-500/10 flex flex-col md:flex-row items-center justify-between gap-4 bg-black/20">
              <p className="text-xs text-gray-500">
                Menampilkan halaman <span className="text-gray-200 font-bold">{currentPage}</span> dari <span className="text-gray-200 font-bold">{totalPages}</span>
              </p>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-white/5 border border-purple-500/20 text-gray-400 hover:text-gray-200 disabled:opacity-30 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <div className="flex items-center gap-1">
                  {getPageNumbers().map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-medium transition-all ${
                        currentPage === pageNum
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/20'
                          : 'bg-white/5 border border-purple-500/10 text-gray-400 hover:text-gray-200 hover:border-purple-500/30'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-white/5 border border-purple-500/20 text-gray-400 hover:text-gray-200 disabled:opacity-30 transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
