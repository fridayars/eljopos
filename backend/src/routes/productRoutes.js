const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middlewares/authMiddleware');

// GET /api/master/products/export
router.get('/export', authMiddleware, productController.exportProducts);

module.exports = router;
