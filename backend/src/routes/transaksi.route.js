const express = require('express');
const router = express.Router();
const transaksiController = require('../controllers/transaksi.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { createTransaksiValidation } = require('../validations/transaksi.validation');
const validate = require('../middlewares/validate.middleware');

// POST /api/transaksi
router.post('/', authMiddleware, createTransaksiValidation, validate, transaksiController.createTransaksi);

// GET /api/transaksi/:id
router.get('/:id', transaksiController.getTransaksiDetail);

// DELETE /api/transaksi/:id
router.delete('/:id', authMiddleware, transaksiController.deleteTransaksi);

module.exports = router;
