const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplier.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/', authMiddleware, supplierController.getAllSuppliers);
router.post('/', authMiddleware, supplierController.createSupplier);

module.exports = router;
