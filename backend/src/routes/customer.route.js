const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { createCustomerValidation, updateCustomerValidation } = require('../validations/customer.validation');
const validate = require('../middlewares/validate.middleware');

// GET /api/master/customers
router.get('/', authMiddleware, customerController.getAllCustomers);

// POST /api/master/customers
router.post('/', authMiddleware, createCustomerValidation, validate, customerController.createCustomer);

// PUT /api/master/customers/:id
router.put('/:id', authMiddleware, updateCustomerValidation, validate, customerController.updateCustomer);

// DELETE /api/master/customers/:id
router.delete('/:id', authMiddleware, customerController.deleteCustomer);

module.exports = router;
