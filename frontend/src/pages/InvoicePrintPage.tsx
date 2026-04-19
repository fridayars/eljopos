import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getTransactionDetail } from '../services/reportService';
import type { TransactionDetailData } from '../services/reportService';
import { Loader2, Bluetooth } from 'lucide-react';
import html2canvas from 'html2canvas';
// @ts-ignore - Library tidak memiliki tipe data TypeScript resmi
import ReceiptPrinterEncoder from '@point-of-sale/receipt-printer-encoder';

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
    const invoiceRef = useRef<HTMLDivElement>(null);
    const [isBluetoothPrinting, setIsBluetoothPrinting] = useState(false);

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

    const handleDownloadImage = async () => {
        if (!invoiceRef.current) return;

        try {
            const canvas = await html2canvas(invoiceRef.current, {
                scale: 2, // Biar resolusinya bagus
                backgroundColor: '#ffffff',
                ignoreElements: (element) => element.classList.contains('no-print')
            });

            const image = canvas.toDataURL('image/jpeg', 1.0);
            const link = document.createElement('a');
            link.href = image;
            link.download = `Invoice-${detail.receipt_number}.jpg`;
            link.click();
        } catch (err) {
            console.error('Gagal mengunduh gambar:', err);
        }
    };

    const handleBluetoothPrint = async () => {
        if (!detail) return;
        const nav = navigator as any;
        if (!nav.bluetooth) {
            alert('Browser Anda tidak mendukung Web Bluetooth API. Coba gunakan Google Chrome di Android/PC.');
            return;
        }

        try {
            setIsBluetoothPrinting(true);

            const device = await nav.bluetooth.requestDevice({
                filters: [{ services: ['000018f0-0000-1000-8000-00805f9b34fb'] }],
                optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb']
            }).catch(() => {
                return nav.bluetooth.requestDevice({
                    acceptAllDevices: true,
                    optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb', 'e7810a71-73ae-499d-8c15-faa9aef0c3f2']
                });
            });

            if (!device || !device.gatt) throw new Error('Perangkat tidak ditemukan atau GATT tidak didukung');

            const server = await device.gatt.connect();

            let service;
            try {
                service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
            } catch (e) {
                const services = await server.getPrimaryServices();
                if (services.length > 0) {
                    service = services[0];
                } else {
                    throw new Error('Tidak ada layanan Bluetooth ditemukan');
                }
            }

            const characteristics = await service.getCharacteristics();
            const characteristic = characteristics.find((c: any) => c.properties.write || c.properties.writeWithoutResponse);

            if (!characteristic) throw new Error('Tidak ada characteristic yang bisa ditulis');

            const encoder = new ReceiptPrinterEncoder({
                language: 'esc-pos',
                width: 32, // Ukuran lebar 58mm
            });

            encoder.initialize()
                .align('center')
                .bold(true)
                .line(detail.store?.name || 'eljoPOS')
                .bold(false)
                .line((detail.store as any)?.address || 'Cabang Utama')
                .newline()
                .rule({ style: 'dashed' })
                .align('left')
                .table(
                    [
                        { width: 10, align: 'left' },
                        { width: 22, align: 'right' }
                    ],
                    [
                        ['No:', detail.receipt_number],
                        ['Tgl:', dateStr],
                        ['Kasir:', detail.user?.username || '-'],
                        ['Plgn:', detail.customer?.name || 'Walk-in']
                    ]
                )
                .rule({ style: 'dashed' });

            detail.details.forEach(item => {
                encoder.line(item.item_name);
                encoder.table(
                    [
                        { width: 18, align: 'left' },
                        { width: 14, align: 'right' }
                    ],
                    [
                        [`${item.quantity} x ${formatCurrency(item.price)}`, formatCurrency(item.subtotal)]
                    ]
                );
            });

            encoder.rule({ style: 'dashed' });

            encoder.table(
                [
                    { width: 16, align: 'left' },
                    { width: 16, align: 'right' }
                ],
                [
                    ['Subtotal', formatCurrency(detail.subtotal || detail.total_amount)]
                ]
            );

            if (detail.discount && Number(detail.discount) > 0) {
                encoder.table(
                    [
                        { width: 16, align: 'left' },
                        { width: 16, align: 'right' }
                    ],
                    [
                        ['Diskon', `-${formatCurrency(Number(detail.discount))}`]
                    ]
                );
            }

            encoder.bold(true).table(
                [
                    { width: 16, align: 'left' },
                    { width: 16, align: 'right' }
                ],
                [
                    ['TOTAL', formatCurrency(detail.total_amount)]
                ]
            ).bold(false);

            encoder.rule({ style: 'dashed' });

            detail.payments?.forEach(payment => {
                encoder.table(
                    [
                        { width: 16, align: 'left' },
                        { width: 16, align: 'right' }
                    ],
                    [
                        [payment.method.toUpperCase(), formatCurrency(payment.amount)]
                    ]
                );
            });

            const totalPaid = detail.payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
            const change = totalPaid - detail.total_amount;
            if (change > 0) {
                encoder.rule({ style: 'dashed' });
                encoder.table(
                    [
                        { width: 16, align: 'left' },
                        { width: 16, align: 'right' }
                    ],
                    [
                        ['Kembali', formatCurrency(change)]
                    ]
                );
            }

            encoder.newline().newline()
                .align('center')
                .bold(true)
                .line('TERIMA KASIH')
                .bold(false)
                .line('Barang yang sudah dibeli')
                .line('tidak dapat ditukar/dikembalikan')
                .newline()
                .newline()
                .newline();

            const result = encoder.encode();

            const CHUNK_SIZE = 512;
            for (let i = 0; i < result.length; i += CHUNK_SIZE) {
                const chunk = result.slice(i, i + CHUNK_SIZE);
                await characteristic.writeValue(chunk);
            }

            if (device.gatt.connected) {
                device.gatt.disconnect();
            }

        } catch (err: any) {
            console.error('Bluetooth Print Error:', err);
            if (err.name !== 'NotFoundError') {
                alert(`Gagal mencetak: ${err.message || 'Pastikan bluetooth menyala dan printer terhubung'}`);
            }
        } finally {
            setIsBluetoothPrinting(false);
        }
    };

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
            <div
                ref={invoiceRef}
                className="mx-auto w-full max-w-[80mm] p-4 text-black font-mono text-[11px] leading-tight flex flex-col items-center"
            >
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
                    <div className="flex justify-between mb-1 gap-2">
                        <span className="shrink-0">Kasir:</span>
                        <span className="text-right break-words">{detail.user?.username || '-'}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                        <span className="shrink-0">Plgn:</span>
                        <span className="text-right break-words">{detail.customer?.name || 'Walk-in'}</span>
                    </div>
                </div>

                {/* Item List */}
                <div className="w-full mb-3 pb-2 border-b border-black border-dashed">
                    {detail.details.map((item, idx) => (
                        <div key={idx} className="mb-2">
                            <div className="w-full break-words font-semibold mb-0.5 leading-tight">{item.item_name}</div>
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
                    <div className="mt-8 flex gap-2 no-print w-full justify-center flex-wrap">
                        <button
                            onClick={handleBluetoothPrint}
                            disabled={isBluetoothPrinting}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded text-xs font-sans flex items-center justify-center gap-1"
                        >
                            {isBluetoothPrinting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bluetooth className="w-4 h-4" />}
                            {isBluetoothPrinting ? 'Mencetak...' : 'Print BT'}
                        </button>
                        <button
                            onClick={handleDownloadImage}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-sans flex items-center justify-center gap-1"
                        >
                            Download
                        </button>
                        <button
                            onClick={() => window.print()}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-sans"
                        >
                            Cetak
                        </button>
                        <button
                            onClick={() => window.close()}
                            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs font-sans"
                        >
                            Tutup
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
