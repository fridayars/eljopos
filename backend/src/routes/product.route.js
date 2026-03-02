const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const multer = require('multer');

const upload = multer();

// GET /api/master/products/export
router.get('/export', authMiddleware, productController.exportProducts);

// GET /api/master/products
router.get('/', authMiddleware, productController.getAllProducts);

// GET /api/master/products/categories
router.get('/categories', authMiddleware, productController.getProductCategories);

// POST /api/master/products/import
router.post('/import', authMiddleware, upload.single('file'), productController.importProducts);

module.exports = router;
