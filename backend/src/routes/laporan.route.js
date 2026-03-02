const express = require('express');
const router = express.Router();
const transaksiController = require('../controllers/transaksi.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { query } = require('express-validator');
const validate = require('../middlewares/validate.middleware');

// Validation untuk query params laporan penjualan
const laporanValidation = [
    query('start_date')
        .notEmpty()
        .withMessage('Start date is required')
        .isDate()
        .withMessage('Start date must be a valid date (YYYY-MM-DD)'),

    query('end_date')
        .notEmpty()
        .withMessage('End date is required')
        .isDate()
        .withMessage('End date must be a valid date (YYYY-MM-DD)'),

    query('store_id')
        .optional()
        .isUUID()
        .withMessage('Store ID must be a valid UUID'),

    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100')
];

// GET /api/laporan/penjualan
router.get('/penjualan', authMiddleware, laporanValidation, validate, transaksiController.getLaporanPenjualan);

module.exports = router;
