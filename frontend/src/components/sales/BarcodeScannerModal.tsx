import { useEffect, useRef, useState } from 'react'
import { X, SwitchCamera, Camera } from 'lucide-react'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'

interface BarcodeScannerModalProps {
    isOpen: boolean
    onClose: () => void
    onScanSuccess: (decodedText: string) => void
}

export function BarcodeScannerModal({ isOpen, onClose, onScanSuccess }: BarcodeScannerModalProps) {
    const [error, setError] = useState<string | null>(null)
    const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
    const scannerRef = useRef<Html5Qrcode | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const isStartingRef = useRef(false)

    const startScanner = async () => {
        if (isStartingRef.current) return
        isStartingRef.current = true
        setError(null)

        try {
            // Cleanup previous instance
            if (scannerRef.current) {
                try {
                    const state = scannerRef.current.getState()
                    if (state === 2) { // SCANNING
                        await scannerRef.current.stop()
                    }
                } catch {
                    // ignore
                }
                scannerRef.current.clear()
                scannerRef.current = null
            }

            const scanner = new Html5Qrcode('barcode-scanner-region', {
                formatsToSupport: [
                    Html5QrcodeSupportedFormats.QR_CODE,
                    Html5QrcodeSupportedFormats.EAN_13,
                    Html5QrcodeSupportedFormats.EAN_8,
                    Html5QrcodeSupportedFormats.UPC_A,
                    Html5QrcodeSupportedFormats.UPC_E,
                    Html5QrcodeSupportedFormats.CODE_128,
                    Html5QrcodeSupportedFormats.CODE_39,
                    Html5QrcodeSupportedFormats.CODE_93,
                    Html5QrcodeSupportedFormats.ITF,
                ],
                verbose: false,
            })
            scannerRef.current = scanner

            await scanner.start(
                { facingMode },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                },
                (decodedText) => {
                    // On successful scan
                    onScanSuccess(decodedText)
                    handleClose()
                },
                () => {
                    // QR code not found — ignore, keep scanning
                }
            )
        } catch (err) {
            console.error('Scanner error:', err)
            if (err instanceof Error) {
                if (err.message.includes('Permission') || err.message.includes('NotAllowed')) {
                    setError('Akses kamera ditolak. Silakan izinkan akses kamera di pengaturan browser Anda.')
                } else if (err.message.includes('NotFound') || err.message.includes('Requested device not found')) {
                    setError('Kamera tidak ditemukan pada perangkat ini.')
                } else {
                    setError(`Gagal memulai scanner: ${err.message}`)
                }
            } else {
                setError('Gagal memulai scanner. Pastikan kamera tersedia.')
            }
        } finally {
            isStartingRef.current = false
        }
    }

    const handleClose = async () => {
        try {
            if (scannerRef.current) {
                const state = scannerRef.current.getState()
                if (state === 2) { // SCANNING
                    await scannerRef.current.stop()
                }
                scannerRef.current.clear()
                scannerRef.current = null
            }
        } catch {
            // ignore cleanup errors
        }
        onClose()
    }

    const handleSwitchCamera = async () => {
        setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')
    }

    // Start scanner when modal opens or camera switches
    useEffect(() => {
        if (isOpen) {
            // Small delay to ensure DOM is ready
            const timer = setTimeout(() => {
                startScanner()
            }, 300)
            return () => clearTimeout(timer)
        }
    }, [isOpen, facingMode])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                try {
                    const state = scannerRef.current.getState()
                    if (state === 2) {
                        scannerRef.current.stop().then(() => {
                            scannerRef.current?.clear()
                        })
                    } else {
                        scannerRef.current.clear()
                    }
                } catch {
                    // ignore
                }
            }
        }
    }, [])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="border border-purple-500/20 rounded-2xl w-full max-w-md overflow-hidden shadow-[0_0_40px_rgba(168,85,247,0.15)]" style={{ background: 'var(--surface-modal)' }}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-purple-500/10">
                    <div className="flex items-center gap-2">
                        <Camera className="w-5 h-5 text-purple-400" />
                        <h3 className="text-lg font-semibold text-gray-200">Scan Barcode / QR</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleSwitchCamera}
                            className="p-2 rounded-lg bg-white/5 border border-purple-500/20 text-gray-400 hover:text-purple-400 hover:border-purple-500/40 transition-all"
                            title="Ganti Kamera"
                        >
                            <SwitchCamera className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleClose}
                            className="p-2 rounded-lg bg-white/5 border border-purple-500/20 text-gray-400 hover:text-red-400 hover:border-red-500/40 transition-all"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Scanner Region */}
                <div className="p-4">
                    <div
                        ref={containerRef}
                        id="barcode-scanner-region"
                        className="w-full rounded-xl overflow-hidden bg-black/50 min-h-[300px]"
                    />

                    {error && (
                        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <p className="mt-3 text-xs text-gray-500 text-center">
                        Arahkan kamera ke barcode atau QR code produk
                    </p>
                </div>
            </div>
        </div>
    )
}
