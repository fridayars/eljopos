import { useState, useEffect, useCallback } from 'react';
import { Search, Download, Image, X, ChevronLeft, ChevronRight, Loader2, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

import { getLaporanKlaimGaransi, type LaporanKlaimGaransiItem } from '../../services/garansiService';
import { DateRangePicker } from '../ui/DateRangePicker';

const TINDAKAN_LABEL: Record<string, string> = {
    ganti_sparepart: 'Ganti Sparepart',
    perbaikan_ulang: 'Perbaikan Ulang',
    pengembalian_dana: 'Pengembalian Dana',
    lainnya: 'Lainnya',
};

function formatDate(dateStr: string) {
    try {
        const date = new Date(dateStr);
        return date.toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return dateStr;
    }
}

interface ImageSlideshowModalProps {
    images: string[];
    onClose: () => void;
    initialIndex?: number;
}

function ImageSlideshowModal({ images, onClose, initialIndex = 0 }: ImageSlideshowModalProps) {
    const [current, setCurrent] = useState(initialIndex);

    const prev = () => setCurrent((c) => (c - 1 + images.length) % images.length);
    const next = () => setCurrent((c) => (c + 1) % images.length);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') prev();
            else if (e.key === 'ArrowRight') next();
            else if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [images.length]);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative flex flex-col items-center max-w-4xl w-full mx-4"
                >
                    {/* Close */}
                    <button
                        onClick={onClose}
                        className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/20 transition-all z-10"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Counter */}
                    <div className="absolute -top-12 left-0 text-sm text-gray-400 font-medium">
                        {current + 1} / {images.length}
                    </div>

                    {/* Image */}
                    <div className="relative w-full bg-black/40 rounded-2xl border border-white/10 overflow-hidden shadow-2xl"
                        style={{ maxHeight: '75vh' }}>
                        <AnimatePresence mode="wait">
                            <motion.img
                                key={current}
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -30 }}
                                transition={{ duration: 0.2 }}
                                src={images[current]}
                                alt={`Bukti ${current + 1}`}
                                className="w-full object-contain"
                                style={{ maxHeight: '75vh' }}
                            />
                        </AnimatePresence>

                        {/* Nav arrows */}
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={prev}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white hover:bg-black/80 transition-all"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={next}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white hover:bg-black/80 transition-all"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Thumbnails */}
                    {images.length > 1 && (
                        <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrent(idx)}
                                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${idx === current ? 'border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.6)]' : 'border-white/20 opacity-60 hover:opacity-100'}`}
                                >
                                    <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

export function WarrantyClaimReport() {
    const today = new Date().toISOString().split('T')[0];

    const [currentStoreId] = useState<string | undefined>(() => {
        try {
            const userRaw = localStorage.getItem('user');
            if (userRaw) {
                const user = JSON.parse(userRaw);
                return user.store_id || undefined;
            }
        } catch { }
        return undefined;
    });

    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [searchQuery, setSearchQuery] = useState('');
    const [data, setData] = useState<LaporanKlaimGaransiItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalCount, setTotalCount] = useState(0);

    // Slideshow state
    const [slideshowImages, setSlideshowImages] = useState<string[]>([]);
    const [slideshowOpen, setSlideshowOpen] = useState(false);

    const openSlideshow = (images: string[]) => {
        if (images.length === 0) {
            toast.info('Tidak ada gambar bukti untuk item ini');
            return;
        }
        setSlideshowImages(images);
        setSlideshowOpen(true);
    };

    const fetchData = useCallback(async (page: number, reset = false) => {
        setIsLoading(true);
        try {
            const res = await getLaporanKlaimGaransi({
                start_date: startDate,
                end_date: endDate,
                page,
                limit: 20,
                store_id: currentStoreId,
            });
            if (res.success) {
                setData(prev => reset ? res.data.items : [...prev, ...res.data.items]);
                setHasMore(res.data.meta.page < res.data.meta.total_pages);
                setCurrentPage(page);
                setTotalCount(res.data.meta.total);
            }
        } catch (err: any) {
            toast.error(err.message || 'Gagal memuat laporan klaim garansi');
        } finally {
            setIsLoading(false);
        }
    }, [startDate, endDate, currentStoreId]);

    useEffect(() => {
        fetchData(1, true);
    }, [fetchData]);

    // Infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoading) {
                    fetchData(currentPage + 1, false);
                }
            },
            { threshold: 0.1 }
        );
        const el = document.getElementById('warranty-load-more');
        if (el) observer.observe(el);
        return () => observer.disconnect();
    }, [hasMore, isLoading, currentPage, fetchData]);

    // Client-side search
    const filtered = data.filter((item) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            item.transaksiDetail?.transaksi?.receipt_number?.toLowerCase().includes(q) ||
            item.transaksiDetail?.transaksi?.customer?.name?.toLowerCase().includes(q) ||
            item.transaksiDetail?.staff?.name?.toLowerCase().includes(q) ||
            item.transaksiDetail?.item_name?.toLowerCase().includes(q) ||
            item.tipe_hp?.name?.toLowerCase().includes(q) ||
            item.supplier?.name?.toLowerCase().includes(q) ||
            item.merk?.toLowerCase().includes(q)
        );
    });

    const handleExport = () => {
        const exportData = filtered.map((item, idx) => ({
            'No': idx + 1,
            'No Invoice': item.transaksiDetail?.transaksi?.receipt_number || '-',
            'Tanggal Transaksi': formatDate(item.transaksiDetail?.transaksi?.created_at || ''),
            'Tanggal Klaim': formatDate(item.tanggal_klaim),
            'Nama Customer': item.transaksiDetail?.transaksi?.customer?.name || 'Walk-in',
            'Nama Kasir': item.user?.username || '-',
            'Nama Teknisi': item.transaksiDetail?.staff?.name || '-',
            'Nama Item': item.transaksiDetail?.item_name || '-',
            'Tipe HP': item.tipe_hp?.name || '-',
            'Tindakan': TINDAKAN_LABEL[item.tindakan] || item.tindakan,
            'Detail Tindakan': item.detail_tindakan || '-',
            'Kendala': item.kendala || '-',
            'Supplier': item.supplier?.name || '-',
            'Merk': item.merk || '-',
            'Jumlah Foto Bukti': item.bukti?.length || 0,
        }));
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Laporan Klaim Garansi');
        XLSX.writeFile(wb, `laporan_klaim_garansi_${startDate}_${endDate}.xlsx`);
        toast.success('Laporan berhasil diekspor ke Excel');
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Summary Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-amber-500/10 to-orange-600/10 border border-amber-500/20 rounded-2xl p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                        <Shield className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Klaim Garansi</p>
                        <p className="text-2xl font-bold text-amber-400">{totalCount}</p>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/20 rounded-2xl p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center shrink-0">
                        <Image className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Foto Bukti</p>
                        <p className="text-2xl font-bold text-cyan-400">
                            {data.reduce((sum, item) => sum + (item.bukti?.length || 0), 0)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col xl:flex-row gap-4">
                <div className="flex items-center gap-3 p-2 bg-white/5 border border-purple-500/10 rounded-2xl">
                    <DateRangePicker
                        startDate={startDate}
                        endDate={endDate}
                        onDateChange={(start, end) => {
                            setStartDate(start);
                            setEndDate(end);
                        }}
                    />
                </div>
                <div className="flex flex-1 gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Cari invoice, customer, teknisi, item, tipe HP, supplier..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-full pl-11 pr-4 py-3 bg-white/5 border border-purple-500/20 rounded-2xl text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500/40 transition-all"
                        />
                    </div>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-600/20 border border-amber-500/30 text-amber-400 hover:text-white hover:from-amber-500 hover:to-orange-600 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all whitespace-nowrap font-medium text-sm"
                    >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Ekspor Excel</span>
                        <span className="sm:hidden">Ekspor</span>
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white/5 backdrop-blur-xl border border-amber-500/20 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1200px]">
                        <thead>
                            <tr className="bg-gradient-to-r from-amber-500/10 to-orange-600/10 border-b border-amber-500/20">
                                <th className="text-left text-xs text-gray-400 py-4 px-4 font-bold uppercase tracking-wider whitespace-nowrap">No Invoice</th>
                                <th className="text-left text-xs text-gray-400 py-4 px-4 font-bold uppercase tracking-wider whitespace-nowrap">Tgl Transaksi</th>
                                <th className="text-left text-xs text-gray-400 py-4 px-4 font-bold uppercase tracking-wider whitespace-nowrap">Tgl Klaim</th>
                                <th className="text-left text-xs text-gray-400 py-4 px-4 font-bold uppercase tracking-wider whitespace-nowrap">Customer</th>
                                <th className="text-left text-xs text-gray-400 py-4 px-4 font-bold uppercase tracking-wider whitespace-nowrap">Kasir</th>
                                <th className="text-left text-xs text-gray-400 py-4 px-4 font-bold uppercase tracking-wider whitespace-nowrap">Teknisi</th>
                                <th className="text-left text-xs text-gray-400 py-4 px-4 font-bold uppercase tracking-wider whitespace-nowrap">Nama Item</th>
                                <th className="text-left text-xs text-gray-400 py-4 px-4 font-bold uppercase tracking-wider whitespace-nowrap">Tipe HP</th>
                                <th className="text-left text-xs text-gray-400 py-4 px-4 font-bold uppercase tracking-wider whitespace-nowrap">Tindakan</th>
                                <th className="text-left text-xs text-gray-400 py-4 px-4 font-bold uppercase tracking-wider whitespace-nowrap">Detail Tindakan</th>
                                <th className="text-left text-xs text-gray-400 py-4 px-4 font-bold uppercase tracking-wider whitespace-nowrap">Kendala</th>
                                <th className="text-left text-xs text-gray-400 py-4 px-4 font-bold uppercase tracking-wider whitespace-nowrap">Supplier</th>
                                <th className="text-left text-xs text-gray-400 py-4 px-4 font-bold uppercase tracking-wider whitespace-nowrap">Merk</th>
                                <th className="text-center text-xs text-gray-400 py-4 px-4 font-bold uppercase tracking-wider whitespace-nowrap">Bukti</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-amber-500/10">
                            {isLoading && data.length === 0 ? (
                                <tr>
                                    <td colSpan={14} className="py-16 text-center">
                                        <div className="flex items-center justify-center gap-2 text-gray-500">
                                            <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
                                            Memuat data klaim garansi...
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={14} className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-3 text-gray-500">
                                            <Shield className="w-12 h-12 text-gray-600 opacity-50" />
                                            <p className="text-sm">Tidak ada data klaim garansi ditemukan</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((item) => {
                                    const transaksi = item.transaksiDetail?.transaksi;
                                    const images = item.bukti?.map(b => b.image_url) || [];
                                    const tindakanLabel = TINDAKAN_LABEL[item.tindakan] || item.tindakan;

                                    return (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-white/[0.03] transition-colors group"
                                        >
                                            {/* No Invoice */}
                                            <td className="py-3.5 px-4">
                                                <span className="text-amber-400 text-sm font-medium whitespace-nowrap">
                                                    {transaksi?.receipt_number || '-'}
                                                </span>
                                            </td>

                                            {/* Tgl Transaksi */}
                                            <td className="py-3.5 px-4 text-gray-400 text-xs whitespace-nowrap">
                                                {transaksi?.created_at ? formatDate(transaksi.created_at) : '-'}
                                            </td>

                                            {/* Tgl Klaim */}
                                            <td className="py-3.5 px-4 text-gray-300 text-xs whitespace-nowrap">
                                                {formatDate(item.tanggal_klaim)}
                                            </td>

                                            {/* Customer */}
                                            <td className="py-3.5 px-4 text-gray-300 text-sm max-w-[140px] truncate">
                                                {transaksi?.customer?.name || 'Walk-in'}
                                            </td>

                                            {/* Kasir */}
                                            <td className="py-3.5 px-4 text-gray-300 text-sm whitespace-nowrap">
                                                {item.user?.username || '-'}
                                            </td>

                                            {/* Teknisi */}
                                            <td className="py-3.5 px-4 text-gray-300 text-sm whitespace-nowrap">
                                                {item.transaksiDetail?.staff?.name || '-'}
                                            </td>

                                            {/* Nama Item */}
                                            <td className="py-3.5 px-4 text-gray-200 text-sm font-medium max-w-[160px] truncate">
                                                {item.transaksiDetail?.item_name || '-'}
                                            </td>

                                            {/* Tipe HP */}
                                            <td className="py-3.5 px-4">
                                                {item.tipe_hp ? (
                                                    <span className="px-2 py-1 rounded-lg text-xs bg-blue-500/15 text-blue-400 border border-blue-500/20 whitespace-nowrap">
                                                        {item.tipe_hp.name}
                                                    </span>
                                                ) : <span className="text-gray-600 text-xs">-</span>}
                                            </td>

                                            {/* Tindakan */}
                                            <td className="py-3.5 px-4">
                                                <span className={`px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap border ${
                                                    item.tindakan === 'ganti_sparepart'
                                                        ? 'bg-orange-500/15 text-orange-400 border-orange-500/20'
                                                        : item.tindakan === 'perbaikan_ulang'
                                                        ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20'
                                                        : item.tindakan === 'pengembalian_dana'
                                                        ? 'bg-red-500/15 text-red-400 border-red-500/20'
                                                        : 'bg-purple-500/15 text-purple-400 border-purple-500/20'
                                                }`}>
                                                    {tindakanLabel}
                                                </span>
                                            </td>

                                            {/* Detail Tindakan */}
                                            <td className="py-3.5 px-4 text-gray-400 text-xs max-w-[160px]">
                                                <span className="line-clamp-2" title={item.detail_tindakan || '-'}>
                                                    {item.detail_tindakan || '-'}
                                                </span>
                                            </td>

                                            {/* Kendala */}
                                            <td className="py-3.5 px-4 text-gray-400 text-xs max-w-[160px]">
                                                <span className="line-clamp-2" title={item.kendala || '-'}>
                                                    {item.kendala || '-'}
                                                </span>
                                            </td>

                                            {/* Supplier */}
                                            <td className="py-3.5 px-4 text-gray-300 text-sm whitespace-nowrap">
                                                {item.supplier?.name || '-'}
                                            </td>

                                            {/* Merk */}
                                            <td className="py-3.5 px-4 text-gray-300 text-sm whitespace-nowrap">
                                                {item.merk || '-'}
                                            </td>

                                            {/* Bukti / Preview Button */}
                                            <td className="py-3.5 px-4 text-center">
                                                <button
                                                    onClick={() => openSlideshow(images)}
                                                    disabled={images.length === 0}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                                        images.length > 0
                                                            ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30 hover:shadow-[0_0_12px_rgba(6,182,212,0.3)] cursor-pointer'
                                                            : 'bg-white/5 border-white/10 text-gray-600 cursor-not-allowed'
                                                    }`}
                                                >
                                                    <Image className="w-3.5 h-3.5" />
                                                    {images.length > 0 ? `${images.length} Foto` : 'Kosong'}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Infinite scroll trigger */}
                <div id="warranty-load-more" className="h-16 flex items-center justify-center border-t border-amber-500/10 shrink-0">
                    {isLoading && data.length > 0 && (
                        <div className="flex items-center gap-2 text-amber-400">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm">Memuat lebih banyak...</span>
                        </div>
                    )}
                    {!hasMore && filtered.length > 0 && (
                        <p className="text-xs text-gray-600 italic">Semua data klaim garansi telah dimuat</p>
                    )}
                </div>
            </div>

            {/* Image Slideshow Modal */}
            {slideshowOpen && (
                <ImageSlideshowModal
                    images={slideshowImages}
                    onClose={() => setSlideshowOpen(false)}
                />
            )}
        </div>
    );
}
