const { body } = require('express-validator')

const createCategoryValidation = [
    body('name')
        .notEmpty()
        .withMessage('Name is required')
        .isString()
        .withMessage('Name must be a string')
        .trim(),

    body('description')
        .optional({ checkFalsy: true })
        .isString()
        .withMessage('Description must be a string')
        .trim(),

    body('is_active')
        .optional()
        .isBoolean()
        .withMessage('is_active must be a boolean')
]

const updateCategoryValidation = [
    body('name')
        .optional()
        .notEmpty()
        .withMessage('Name cannot be empty if provided')
        .isString()
        .withMessage('Name must be a string')
        .trim(),

    body('description')
        .optional({ checkFalsy: true })
        .isString()
        .withMessage('Description must be a string')
        .trim(),

    body('is_active')
        .optional()
        .isBoolean()
        .withMessage('is_active must be a boolean')
]

const createProductValidation = [
    body('kategori_produk_id')
        .notEmpty()
        .withMessage('kategori_produk_id is required')
        .isUUID()
        .withMessage('kategori_produk_id must be a valid UUID'),

    body('name')
        .notEmpty()
        .withMessage('name is required')
        .isString()
        .trim(),

    body('sku')
        .notEmpty()
        .withMessage('sku is required')
        .isString()
        .trim(),

    body('price')
        .notEmpty()
        .withMessage('price is required')
        .isNumeric()
        .withMessage('price must be numeric'),

    body('cost_price')
        .optional()
        .isNumeric()
        .withMessage('cost_price must be numeric'),

    body('stock')
        .optional()
        .isInt({ min: 0 })
        .withMessage('stock must be a positive integer'),

    body('jasa_pasang')
        .optional()
        .isNumeric(),

    body('ongkir_asuransi')
        .optional()
        .isNumeric(),

    body('biaya_overhead')
        .optional()
        .isNumeric(),

    body('is_active')
        .optional()
        .isBoolean(),

    body('image_url')
        .optional({ checkFalsy: true })
        .isURL()
        .withMessage('image_url must be a valid URL')
]

const updateProductValidation = [
    body('kategori_produk_id')
        .optional()
        .isUUID()
        .withMessage('kategori_produk_id must be a valid UUID'),

    body('name')
        .optional()
        .notEmpty()
        .isString()
        .trim(),

    body('sku')
        .optional()
        .notEmpty()
        .isString()
        .trim(),

    body('price')
        .optional()
        .isNumeric(),

    body('cost_price')
        .optional()
        .isNumeric(),

    body('stock')
        .optional()
        .isInt({ min: 0 }),

    body('jasa_pasang')
        .optional()
        .isNumeric(),

    body('ongkir_asuransi')
        .optional()
        .isNumeric(),

    body('biaya_overhead')
        .optional()
        .isNumeric(),

    body('is_active')
        .optional()
        .isBoolean(),

    body('image_url')
        .optional({ checkFalsy: true })
        .isURL()
]

module.exports = {
    createCategoryValidation,
    updateCategoryValidation,
    createProductValidation,
    updateProductValidation
}
