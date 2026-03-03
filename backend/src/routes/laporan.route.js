const express = require('express');
const router = express.Router();
const transaksiController = require('../controllers/transaksi.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { laporanPenjualanValidation } = require('../validations/laporan.validation');
const validate = require('../middlewares/validate.middleware');

// GET /api/laporan/penjualan
router.get('/penjualan', authMiddleware, laporanPenjualanValidation, validate, transaksiController.getLaporanPenjualan);

module.exports = router;
