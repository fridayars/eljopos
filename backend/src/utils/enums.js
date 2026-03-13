/**
 * Enum for Jenis Mutasi Stok Produk
 * Digunakan untuk mencatat referensi dari tipe mutasi stok di tabel mutasi_stok_produk.
 */
const JENIS_MUTASI_STOK = {
    PENJUALAN: 'PENJUALAN',               // Pengurangan stok karena transaksi penjualan
    PENAMBAHAN_STOK: 'PENAMBAHAN_STOK',   // Penambahan stok manual
    PENGURANGAN_STOK: 'PENGURANGAN_STOK', // Pengurangan stok manual (rusak, hilang, dll)
    TRANSFER_STOK: 'TRANSFER_STOK',       // Penyesuaian stok karena transfer dari toko lain
    IMPORT_DATA: 'IMPORT_DATA',           // Penyesuaian stok dari import data excel/csv awal
    HAPUS_TRANSAKSI: 'HAPUS_TRANSAKSI',   // Penambahan stok kembali karena transaksi dibatalkan/dihapus
    STOK_OPNAME: 'STOK_OPNAME',           // Penyesuaian stok dari hasil stok opname (bisa +/-)
};

module.exports = {
    JENIS_MUTASI_STOK
};
