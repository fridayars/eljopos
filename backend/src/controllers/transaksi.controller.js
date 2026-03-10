const transaksiService = require('../services/transaksi.service');

/**
 * Buat Transaksi (Kasir) — POST /api/transaksi
 */
const createTransaksi = async (req, res, next) => {
    try {
        const result = await transaksiService.createTransaksi(req.body, req.user.user_id);

        return res.status(201).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get Detail Transaksi — GET /api/transaksi/:id
 */
const getTransaksiDetail = async (req, res, next) => {
    try {
        const result = await transaksiService.getTransaksiDetail(req.params.id);

        return res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Laporan Penjualan (Histori) — GET /api/laporan/penjualan
 */
const getLaporanPenjualan = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const { start_date, end_date, store_id } = req.query;

        const result = await transaksiService.getLaporanPenjualan({
            start_date,
            end_date,
            store_id: store_id || req.user.store_id,
            page,
            limit
        });

        return res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete Transaksi — DELETE /api/transaksi/:id
 */
const deleteTransaksi = async (req, res, next) => {
    try {
        await transaksiService.deleteTransaksi(req.params.id);

        return res.json({
            success: true,
            message: 'Transaksi berhasil dihapus'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { createTransaksi, getTransaksiDetail, getLaporanPenjualan, deleteTransaksi };
