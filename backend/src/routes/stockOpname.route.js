const express = require('express');
const router = express.Router();
const stockOpnameController = require('../controllers/stockOpname.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createStockOpnameValidation, updateStockOpnameValidation } = require('../validations/stockOpname.validation');

router.use(authMiddleware);

router.post('/', createStockOpnameValidation, validate, stockOpnameController.createStockOpname);
router.get('/', stockOpnameController.getAllStockOpnames);
router.get('/:id', stockOpnameController.getStockOpnameById);
router.put('/:id', updateStockOpnameValidation, validate, stockOpnameController.updateStockOpname);
router.post('/:id/complete', stockOpnameController.completeStockOpname);
router.post('/:id/cancel', stockOpnameController.cancelStockOpname);

module.exports = router;
