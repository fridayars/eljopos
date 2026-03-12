const { MutasiStokProduk } = require('../models');
const { JENIS_MUTASI_STOK } = require('./enums');

/**
 * Helper untuk insert data mutasi stok (Bisa single atau bulk)
 *
 * @param {Object|Array} mutasiData - Data mutasi tunggal atau array dari object mutasi
 * @param {string} mutasiData.jenis_mutasi - Bisa ambil dari enum JENIS_MUTASI_STOK
 * @param {string} mutasiData.product_id - UUID produk (Wajib)
 * @param {string} [mutasiData.reference_id] - UUID referensi transaksi (Opsional)
 * @param {number} mutasiData.stok - Jumlah mutasi (-/+). (Wajib)
 * @param {string} [mutasiData.keterangan] - Keterangan opsional
 * @param {Object} [options] - Opsi tambahan untuk Sequelize (seperti parameter transaction)
 * @returns {Promise<MutasiStokProduk|MutasiStokProduk[]>} Berhasil membuat mutasi
 */
const insertMutasiStok = async (mutasiData, options = {}) => {
    try {
        if (!mutasiData) {
            throw new Error('Data mutasi stok tidak boleh kosong');
        }

        // Validasi jenis mutasi
        const validMutasiTypes = Object.values(JENIS_MUTASI_STOK);

        // Cek jika bulk insert (Array)
        if (Array.isArray(mutasiData)) {
            if (mutasiData.length === 0) return [];
            
            // Validasi mandatory fields untuk bulk insert
            mutasiData.forEach((data, index) => {
                if (!data.product_id || !data.jenis_mutasi || data.stok === undefined) {
                    throw new Error(`Data mutasi pada index ${index} tidak lengkap. Wajib memiliki product_id, jenis_mutasi, dan stok`);
                }
                if (!validMutasiTypes.includes(data.jenis_mutasi)) {
                    throw new Error(`Jenis mutasi pada index ${index} tidak valid. Harus salah satu dari: ${validMutasiTypes.join(', ')}`);
                }
            });

            return await MutasiStokProduk.bulkCreate(mutasiData, options);
        }

        // Untuk Single Insert (Object)
        if (!mutasiData.product_id || !mutasiData.jenis_mutasi || mutasiData.stok === undefined) {
            throw new Error('Data mutasi tidak lengkap. Wajib memiliki product_id, jenis_mutasi, dan stok');
        }

        if (!validMutasiTypes.includes(mutasiData.jenis_mutasi)) {
            throw new Error(`Jenis mutasi tidak valid. Harus salah satu dari: ${validMutasiTypes.join(', ')}`);
        }

        return await MutasiStokProduk.create(mutasiData, options);
    } catch (error) {
        console.error('Error on insertMutasiStok helper:', error);
        throw error;
    }
};

module.exports = {
    insertMutasiStok
};
