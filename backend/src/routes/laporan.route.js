const express = require('express');
const router = express.Router();
const transaksiController = require('../controllers/transaksi.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { laporanPenjualanValidation, grafikPenjualanValidation } = require('../validations/laporan.validation');
const validate = require('../middlewares/validate.middleware');

// GET /api/laporan/penjualan
router.get('/penjualan', authMiddleware, laporanPenjualanValidation, validate, transaksiController.getLaporanPenjualan);

// GET /api/laporan/ranking-produk
router.get('/ranking-produk', authMiddleware, laporanPenjualanValidation, validate, transaksiController.getProductRanking);

// GET /api/laporan/ranking-customer
router.get('/ranking-customer', authMiddleware, laporanPenjualanValidation, validate, transaksiController.getCustomerRanking);

// GET /api/laporan/grafik-penjualan
router.get('/grafik-penjualan', authMiddleware, grafikPenjualanValidation, validate, transaksiController.getGrafikPenjualan);

// GET /api/laporan/summary-kartu
router.get('/summary-kartu', authMiddleware, grafikPenjualanValidation, validate, transaksiController.getSummaryKartu);

// GET /api/laporan/arus-uang
router.get('/arus-uang', authMiddleware, grafikPenjualanValidation, validate, transaksiController.getArusUangTable);

// GET /api/laporan/tabel-penjualan
router.get('/tabel-penjualan', authMiddleware, grafikPenjualanValidation, validate, transaksiController.getTabelPenjualan);

module.exports = router;
