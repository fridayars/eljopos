const express = require('express');
const router = express.Router();
const layananController = require('../controllers/layanan.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// GET /api/master/layanan/categories
router.get('/categories', authMiddleware, layananController.getServiceCategories);

// GET /api/master/layanan
router.get('/', authMiddleware, layananController.getAllServices);

module.exports = router;
