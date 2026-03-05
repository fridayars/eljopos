const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const multer = require('multer');
const upload = multer();

const validate = require('../middlewares/validate.middleware');
const {
    createCategoryValidation,
    updateCategoryValidation,
    createProductValidation,
    updateProductValidation
} = require('../validations/product.validation');

// --- PRODUCT ROUTES ---

// GET /api/master/products/export
router.get('/export', authMiddleware, productController.exportProducts);

// GET /api/master/products
router.get('/', authMiddleware, productController.getAllProducts);

// POST /api/master/products
router.post('/', authMiddleware, createProductValidation, validate, productController.createProduct);

// PUT /api/master/products/:id
router.put('/:id', authMiddleware, updateProductValidation, validate, productController.updateProduct);

// DELETE /api/master/products/:id
router.delete('/:id', authMiddleware, productController.deleteProduct);

// PUT /api/master/products/:id/status
router.put('/:id/status', authMiddleware, productController.updateProductStatus);

// --- CATEGORY ROUTES ---

// GET /api/master/products/categories
router.get('/categories', authMiddleware, productController.getProductCategories);

// POST /api/master/products/categories
router.post('/categories', authMiddleware, createCategoryValidation, validate, productController.createCategory);

// PUT /api/master/products/categories/:id
router.put('/categories/:id', authMiddleware, updateCategoryValidation, validate, productController.updateCategory);

// DELETE /api/master/products/categories/:id
router.delete('/categories/:id', authMiddleware, productController.deleteCategory);

// POST /api/master/products/import
router.post('/import', authMiddleware, upload.single('file'), productController.importProducts);

module.exports = router;
