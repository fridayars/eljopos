import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getTransactionDetail } from '../services/reportService';
import type { TransactionDetailData } from '../services/reportService';
import { Loader2 } from 'lucide-react';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

export function InvoicePrintPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isCetak = searchParams.get('cetak') === 'true';

    const [detail, setDetail] = useState<TransactionDetailData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!id) {
            setError('ID Transaksi tidak ditemukan');
            setLoading(false);
            return;
        }

        const fetchDetail = async () => {
            try {
                const res = await getTransactionDetail(id);
                if (res.success && res.data) {
                    setDetail(res.data);
                    // Tunggu render selesai, lalu print jika isCetak
                    if (isCetak) {
                        setTimeout(() => {
                            window.print();
                        }, 500);
                    }
                } else {
                    setError(res.message || 'Gagal memuat detail transaksi');
                }
            } catch (err) {
                setError('Terjadi kesalahan saat memuat data');
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white text-gray-800">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="ml-2">Memuat struk...</span>
            </div>
        );
    }

    if (error || !detail) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white text-gray-800">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 bg-gray-200 rounded text-sm text-gray-800"
                >
                    Kembali
                </button>
            </div>
        );
    }

    const dateStr = new Date(detail.created_at).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <div className="bg-white min-h-screen">
            {/* Styling khusus untuk print thermal menggunakan ukuran 80mm */}
            <style>
                {`
                    @page {
                        margin: 0;
                        size: 80mm auto; /* Atau 58mm auto */
                    }
                    body {
                        margin: 0;
                        background: white;
                        color: black;
                    }
                    @media print {
                        .no-print {
                            display: none !important;
                        }
                    }
                `}
            </style>

            {/* Container struk */}
            <div className="mx-auto w-full max-w-[80mm] p-4 text-black font-mono text-[11px] leading-tight flex flex-col items-center">
                {/* Header */}
                <div className="text-center w-full mb-4 border-b border-black border-dashed pb-3">
                    <h1 className="font-bold text-base mb-1">{detail.store?.name || 'eljoPOS'}</h1>
                    <p className="text-[10px] break-words">{(detail.store as any)?.address || 'Cabang Utama'}</p>
                </div>

                {/* Info Transaksi */}
                <div className="w-full mb-3 pb-2 border-b border-black border-dashed">
                    <div className="flex justify-between mb-1">
                        <span>No:</span>
                        <span>{detail.receipt_number}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                        <span>Tgl:</span>
                        <span>{dateStr}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                        <span>Kasir:</span>
                        <span className="truncate max-w-[100px] text-right">{detail.user?.username || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Plgn:</span>
                        <span className="truncate max-w-[100px] text-right">{detail.customer?.name || 'Walk-in'}</span>
                    </div>
                </div>

                {/* Item List */}
                <div className="w-full mb-3 pb-2 border-b border-black border-dashed">
                    {detail.details.map((item, idx) => (
                        <div key={idx} className="mb-2">
                            <div className="w-full truncate font-semibold mb-0.5">{item.item_name}</div>
                            <div className="flex justify-between">
                                <span>{item.quantity} x {formatCurrency(item.price)}</span>
                                <span>{formatCurrency(item.subtotal)}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary */}
                <div className="w-full mb-3 pb-2 border-b border-black border-dashed">
                    <div className="flex justify-between mb-1">
                        <span>Subtotal</span>
                        <span>{formatCurrency(detail.subtotal || detail.total_amount)}</span>
                    </div>
                    {detail.discount > 0 && (
                        <div className="flex justify-between mb-1">
                            <span>Diskon {detail.discount_type === 'percentage' ? `(${detail.discount}%)` : ''}</span>
                            <span>- {formatCurrency(
                                detail.discount_type === 'percentage'
                                    ? ((detail.subtotal || detail.total_amount) * detail.discount) / 100
                                    : detail.discount
                            )}</span>
                        </div>
                    )}
                    <div className="flex justify-between font-bold text-[12px] mt-1 pt-1 border-t border-black border-dotted">
                        <span>TOTAL</span>
                        <span>{formatCurrency(detail.total_amount)}</span>
                    </div>
                </div>

                {/* Payment Methods */}
                {detail.payments && detail.payments.length > 0 && (
                    <div className="w-full mb-4 pb-2 border-b border-black border-dashed">
                        {detail.payments.map((payment, idx) => (
                            <div key={idx} className="flex justify-between mb-1">
                                <span className="uppercase">{payment.method}</span>
                                <span>{formatCurrency(payment.amount)}</span>
                            </div>
                        ))}
                        {/* Change / Kembalian jika ada */}
                        {(() => {
                            const totalPaid = detail.payments.reduce((sum, p) => sum + Number(p.amount), 0);
                            const change = totalPaid - detail.total_amount;
                            if (change > 0) {
                                return (
                                    <div className="flex justify-between mt-1 pt-1 border-t border-black border-dotted">
                                        <span>Kembali</span>
                                        <span>{formatCurrency(change)}</span>
                                    </div>
                                );
                            }
                            return null;
                        })()}
                    </div>
                )}

                {/* Footer */}
                <div className="text-center w-full mt-2">
                    <p className="font-bold mb-1">TERIMA KASIH</p>
                    <p className="text-[10px]">Barang yang sudah dibeli<br />tidak dapat ditukar/dikembalikan</p>
                </div>

                {/* Tombol aksi manual (hanya tampil di layar) */}
                {isCetak && (
                    <div className="mt-8 flex gap-2 no-print w-full justify-center">
                        <button
                            onClick={() => window.print()}
                            className="px-4 py-2 bg-blue-600 text-white rounded text-xs font-sans"
                        >
                            Cetak Ulang
                        </button>
                        <button
                            onClick={() => window.close()}
                            className="px-4 py-2 bg-gray-600 text-white rounded text-xs font-sans"
                        >
                            Tutup
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
