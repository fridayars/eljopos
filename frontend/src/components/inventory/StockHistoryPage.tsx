import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, History, Calendar, Package, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'motion/react';
import { getStockMutations } from '../../services/productService';
import type { ProductItem, StockMutation } from '../../services/productService';

interface StockHistoryPageProps {
  product: ProductItem;
  onBack: () => void;
}

export function StockHistoryPage({ product, onBack }: StockHistoryPageProps) {
  const [mutations, setMutations] = useState<StockMutation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getStockMutations(product.id, {
        page: currentPage,
        limit: pageSize,
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
  }, [product.id, currentPage]);

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

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0A0A0B]">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-purple-500/10 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-white/5 border border-purple-500/20 text-gray-400 hover:text-white hover:border-purple-500/50 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-200">Riwayat Stok</h1>
            <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
              <Package className="w-4 h-4" />
              {product.name} ({product.sku})
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 border border-purple-500/20 rounded-2xl p-5">
              <p className="text-sm text-gray-500 mb-1">Stok Saat Ini</p>
              <p className="text-2xl font-bold text-gray-200">{product.stock}</p>
            </div>
          </div>

          {/* Mutation Table */}
          <div className="bg-white/5 border border-purple-500/20 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#121214] border-b border-purple-500/20">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Waktu</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipe</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Jumlah</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-500/10">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className="w-8 h-8 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
                          <p className="text-gray-500 text-sm">Memuat data...</p>
                        </div>
                      </td>
                    </tr>
                  ) : mutations.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center text-gray-500">
                        <History className="w-12 h-12 mx-auto mb-4 opacity-10" />
                        <p>Belum ada riwayat mutasi stok</p>
                      </td>
                    </tr>
                  ) : (
                    mutations.map((mutation) => {
                      const isPositive = mutation.stok > 0;
                      const mutasiType = mutation.jenis_mutasi;

                      // Map to UI classification
                      let uiType: 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER' = 'ADJUSTMENT';
                      if (['PENAMBAHAN_STOK', 'IMPORT_DATA', 'HAPUS_TRANSAKSI'].includes(mutasiType)) uiType = 'IN';
                      else if (['PENGURANGAN_STOK', 'PENJUALAN'].includes(mutasiType)) uiType = 'OUT';
                      else if (mutasiType === 'TRANSFER_STOK') uiType = 'TRANSFER';

                      return (
                        <motion.tr
                          key={mutation.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-600" />
                              {formatDate(mutation.created_at)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${uiType === 'IN' ? 'bg-green-500/10 text-green-400' :
                              uiType === 'OUT' ? 'bg-red-500/10 text-red-400' :
                                uiType === 'TRANSFER' ? 'bg-blue-500/10 text-blue-400' :
                                  'bg-orange-500/10 text-orange-400'
                              }`}>
                              {mutasiType.replace('_', ' ')}
                            </span>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${isPositive ? 'text-green-400' : 'text-red-400'
                            }`}>
                            <div className="flex items-center justify-end gap-1">
                              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                              {isPositive ? '+' : ''}{mutation.stok}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-400 max-w-xs truncate">
                            {mutation.keterangan || '-'}
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-purple-500/10 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Halaman <span className="text-gray-200">{currentPage}</span> dari <span className="text-gray-200">{totalPages}</span>
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-white/5 border border-purple-500/20 text-gray-400 hover:text-white disabled:opacity-50 transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg bg-white/5 border border-purple-500/20 text-gray-400 hover:text-white disabled:opacity-50 transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
