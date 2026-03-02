const { body } = require('express-validator')

const createTransaksiValidation = [
    body('store_id')
        .notEmpty()
        .withMessage('Store ID is required')
        .isUUID()
        .withMessage('Store ID must be a valid UUID'),

    body('total_amount')
        .notEmpty()
        .withMessage('Total amount is required')
        .isDecimal()
        .withMessage('Total amount must be a valid number')
        .custom((value) => parseFloat(value) > 0)
        .withMessage('Total amount must be greater than 0'),

    body('payment_method')
        .isArray({ min: 1, max: 2 })
        .withMessage('Payment method is required and must have at least 1 item'),

    body('payment_method.*.method')
        .notEmpty()
        .withMessage('Payment method name is required')
        .isString()
        .withMessage('Payment method name must be a string')
        .trim(),

    body('payment_method.*.amount')
        .notEmpty()
        .withMessage('Payment amount is required')
        .isDecimal()
        .withMessage('Payment amount must be a valid number')
        .custom((value) => parseFloat(value) > 0)
        .withMessage('Payment amount must be greater than 0'),

    body('items')
        .isArray({ min: 1 })
        .withMessage('Items is required and must have at least 1 item'),

    body('items.*.item_type')
        .notEmpty()
        .withMessage('Item type is required')
        .isIn(['product', 'layanan'])
        .withMessage('Item type must be either "product" or "layanan"'),

    body('items.*.item_id')
        .notEmpty()
        .withMessage('Item ID is required')
        .isUUID()
        .withMessage('Item ID must be a valid UUID'),

    body('items.*.item_name')
        .notEmpty()
        .withMessage('Item name is required')
        .isString()
        .withMessage('Item name must be a string')
        .trim(),

    body('items.*.kategori_name')
        .optional()
        .isString()
        .withMessage('Kategori name must be a string')
        .trim(),

    body('items.*.price')
        .notEmpty()
        .withMessage('Price is required')
        .isDecimal()
        .withMessage('Price must be a valid number'),

    body('items.*.quantity')
        .notEmpty()
        .withMessage('Quantity is required')
        .isInt({ min: 1 })
        .withMessage('Quantity must be an integer greater than 0'),

    body('items.*.subtotal')
        .notEmpty()
        .withMessage('Subtotal is required')
        .isDecimal()
        .withMessage('Subtotal must be a valid number'),

    body('customer_id')
        .optional({ values: 'null' })
        .isUUID()
        .withMessage('Customer ID must be a valid UUID')
]

module.exports = { createTransaksiValidation }
