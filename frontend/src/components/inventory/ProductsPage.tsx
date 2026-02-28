import { useState } from 'react'
import { Edit, Download, Upload, ArrowRightLeft, Search, Plus, Trash2 } from 'lucide-react'
import { motion } from 'motion/react'
import * as XLSX from 'xlsx'
import { toast } from 'sonner'
import type { ProductItem } from '../../services/productService'

interface ProductsPageProps {
    products: ProductItem[]
    onEditProduct: (product: ProductItem) => void
    onDeleteProduct: (product: ProductItem) => void
    onImportProducts: (products: Omit<ProductItem, 'id'>[]) => void
    onOpenTransfer: () => void
    onOpenAdd: () => void
}

export function ProductsPage({
    products,
    onEditProduct,
    onDeleteProduct,
    onImportProducts,
    onOpenTransfer,
    onOpenAdd,
}: ProductsPageProps) {
    const [searchQuery, setSearchQuery] = useState('')

    // Filter products
    const filteredProducts = products.filter(
        (product) =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.sku.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    const handleExport = () => {
        const exportData = products.map((product) => ({
            SKU: product.sku,
            Name: product.name,
            Category: product.category_name,
            Type: product.item_type,
            'Cost Price': product.cost_price,
            'Sale Price': product.price,
            Stock: product.item_type === 'product' ? product.stok : '-',
            'Image URL': product.image,
        }))

        const worksheet = XLSX.utils.json_to_sheet(exportData)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Products')

        try {
            XLSX.writeFile(workbook, `products_export_${new Date().toISOString().split('T')[0]}.xlsx`)
            toast.success('Berhasil mengekspor produk')
        } catch (error) {
            console.error('Export error', error)
            toast.error('Gagal mengekspor data produk')
        }
    }

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            try {
                const data = event.target?.result
                const workbook = XLSX.read(data, { type: 'binary' })
                const sheetName = workbook.SheetNames[0]
                const worksheet = workbook.Sheets[sheetName]
                const jsonData = XLSX.utils.sheet_to_json(worksheet)

                const importedProducts: Omit<ProductItem, 'id'>[] = jsonData.map((row: any) => ({
                    kategori_produk_id: 'imported', // dummy for mock
                    sku: row.SKU || `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    name: row.Name || 'Unnamed Product',
                    category_name: row.Category || 'Unknown',
                    item_type: (row.Type && String(row.Type).toLowerCase() === 'layanan') ? 'layanan' : 'product',
                    cost_price: Number(row['Cost Price']) || 0,
                    price: Number(row['Sale Price']) || 0,
                    stok: Number(row.Stock) || 0,
                    image: row['Image URL'] || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=300&fit=crop',
                }))

                onImportProducts(importedProducts)
                toast.success(`${importedProducts.length} produk berhasil diimport`)
            } catch (error) {
                console.error('Import error:', error)
                toast.error('Gagal mengimport produk. Periksa format file Excel.')
            }
        }

        reader.readAsBinaryString(file)
        e.target.value = '' // Reset input
    }

    // Stats
    const physicalProducts = products.filter((p) => p.item_type === 'product')
    const totalPhysical = physicalProducts.length
    const totalServices = products.length - totalPhysical
    const totalStock = physicalProducts.reduce((sum, p) => sum + p.stok, 0)
    const lowStockCount = physicalProducts.filter((p) => p.stok < 10).length
    const totalValue = physicalProducts.reduce((sum, p) => sum + p.price * p.stok, 0)

    return (
        <div className="flex-1 flex flex-col overflow-hidden h-full">
            <div className="flex-1 overflow-y-auto">
                <div className="p-4 md:p-6 space-y-6">
                    {/* Header & Actions */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-xl md:text-2xl text-gray-200">Daftar Produk & Layanan</h2>
                            <p className="text-sm text-gray-500 mt-1">Kelola data item yang ditawarkan</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-purple-500/20 text-gray-400 hover:text-gray-200 hover:border-blue-500/50 transition-all cursor-pointer">
                                <Upload className="w-4 h-4" />
                                <span className="text-sm">Import</span>
                                <input type="file" accept=".xlsx,.xls" onChange={handleImport} className="hidden" />
                            </label>

                            <button
                                onClick={handleExport}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-purple-500/20 text-gray-400 hover:text-gray-200 hover:border-blue-500/50 transition-all cursor-pointer"
                            >
                                <Download className="w-4 h-4" />
                                <span className="text-sm">Export</span>
                            </button>

                            <button
                                onClick={onOpenTransfer}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all cursor-pointer"
                            >
                                <ArrowRightLeft className="w-4 h-4" />
                                <span className="text-sm">Transfer Stok</span>
                            </button>

                            <button
                                onClick={onOpenAdd}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all cursor-pointer"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="text-sm">Tambah Produk</span>
                            </button>
                        </div>
                    </div>

                    {/* Stats Layout */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white/5 backdrop-blur-xl border border-purple-500/20 rounded-xl p-4">
                            <p className="text-sm text-gray-400 mb-1">Total Produk Fisik</p>
                            <p className="text-2xl text-gray-200">{totalPhysical}</p>
                            <p className="text-xs text-gray-500 mt-1">Total {totalStock} item stok</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-xl border border-purple-500/20 rounded-xl p-4">
                            <p className="text-sm text-gray-400 mb-1">Total Layanan</p>
                            <p className="text-2xl text-cyan-400">{totalServices}</p>
                            <p className="text-xs text-gray-500 mt-1">Non-fisik (jasa, dll)</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-xl border border-purple-500/20 rounded-xl p-4">
                            <p className="text-sm text-gray-400 mb-1">Stok Menipis</p>
                            <p className="text-2xl text-red-400">{lowStockCount}</p>
                            <p className="text-xs text-gray-500 mt-1">Di bawah 10 unit</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-xl border border-purple-500/20 rounded-xl p-4">
                            <p className="text-sm text-gray-400 mb-1">Total Valuasi Stok</p>
                            <p className="text-2xl text-green-400">Rp {totalValue.toLocaleString('id-ID')}</p>
                            <p className="text-xs text-gray-500 mt-1">Estimasi berds. harga jual</p>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Cari berdasarkan nama atau kode SKU..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-12 bg-white/5 border border-purple-500/20 rounded-xl pl-12 pr-4 text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all"
                        />
                    </div>

                    {/* Products Table */}
                    <div className="bg-white/5 backdrop-blur-xl border border-purple-500/20 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto min-h-[300px]">
                            <table className="w-full text-left whitespace-nowrap">
                                <thead className="bg-white/5 border-b border-purple-500/20">
                                    <tr>
                                        <th className="px-4 py-4 text-sm font-medium text-gray-400 w-16">Foto</th>
                                        <th className="px-4 py-4 text-sm font-medium text-gray-400">SKU</th>
                                        <th className="px-4 py-4 text-sm font-medium text-gray-400">Nama Item</th>
                                        <th className="px-4 py-4 text-sm font-medium text-gray-400">Tipe / Kategori</th>
                                        <th className="px-4 py-4 text-sm font-medium text-gray-400 text-right">
                                            Harga Jual
                                        </th>
                                        <th className="px-4 py-4 text-sm font-medium text-gray-400 text-right w-24">
                                            Stok
                                        </th>
                                        <th className="px-4 py-4 text-sm font-medium text-gray-400 text-center w-24">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-purple-500/10">
                                    {filteredProducts.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center text-gray-500">
                                                    <Search className="w-10 h-10 mb-3 opacity-20" />
                                                    <p>Tidak ada produk ditemukan</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredProducts.map((product) => (
                                            <motion.tr
                                                key={product.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="hover:bg-white/5 transition-colors group"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 border border-purple-500/20">
                                                        <img
                                                            src={product.image}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.currentTarget.src =
                                                                    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=100&h=100&fit=crop'
                                                            }}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-400 font-mono">
                                                    {product.sku}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-200 font-medium">
                                                    {product.name}
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    <span
                                                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium mr-2 ${product.item_type === 'layanan'
                                                                ? 'bg-cyan-500/10 text-cyan-400'
                                                                : 'bg-blue-500/10 text-blue-400'
                                                            }`}
                                                    >
                                                        {product.item_type === 'layanan' ? 'Layanan' : 'Produk'}
                                                    </span>
                                                    <span className="text-gray-500">{product.category_name}</span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-200 text-right">
                                                    Rp {product.price.toLocaleString('id-ID')}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-right">
                                                    {product.item_type === 'layanan' ? (
                                                        <span className="text-gray-600">-</span>
                                                    ) : (
                                                        <span
                                                            className={`font-medium ${product.stok < 10
                                                                    ? 'text-red-400'
                                                                    : product.stok < 20
                                                                        ? 'text-orange-400'
                                                                        : 'text-green-400'
                                                                }`}
                                                        >
                                                            {product.stok}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => onEditProduct(product)}
                                                            className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all cursor-pointer"
                                                            title="Edit"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => onDeleteProduct(product)}
                                                            className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all cursor-pointer"
                                                            title="Hapus"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
