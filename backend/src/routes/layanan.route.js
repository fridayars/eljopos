const express = require('express');
const router = express.Router();
const layananController = require('../controllers/layanan.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// GET /api/master/layanan/categories
router.get('/categories', authMiddleware, layananController.getServiceCategories);

// POST /api/master/layanan/categories
router.post('/categories', authMiddleware, layananController.createServiceCategory);

// PUT /api/master/layanan/categories/:id
router.put('/categories/:id', authMiddleware, layananController.updateServiceCategory);

// DELETE /api/master/layanan/categories/:id
router.delete('/categories/:id', authMiddleware, layananController.deleteServiceCategory);

// GET /api/master/layanan
router.get('/', authMiddleware, layananController.getAllServices);

// POST /api/master/layanan
router.post('/', authMiddleware, layananController.createService);

// GET /api/master/layanan/:id
router.get('/:id', authMiddleware, layananController.getServiceById);

// PUT /api/master/layanan/:id
router.put('/:id', authMiddleware, layananController.updateService);

// PUT /api/master/layanan/:id/status
router.put('/:id/status', authMiddleware, layananController.updateServiceStatus);

// DELETE /api/master/layanan/:id
router.delete('/:id', authMiddleware, layananController.deleteService);

module.exports = router;
