const { body } = require('express-validator');

const createStockOpnameValidation = [
    body('opname_number')
        .notEmpty().withMessage('Nomor opname harus diisi')
        .isString().withMessage('Nomor opname harus berupa string'),
    body('tanggal')
        .optional()
        .isISO8601().withMessage('Format tanggal tidak valid'),
    body('status')
        .optional()
        .isIn(['DRAFT', 'COMPLETED']).withMessage('Status tidak valid'),
    body('items')
        .isArray({ min: 1 }).withMessage('Minimal harus ada satu produk'),
    body('items.*.product_id')
        .notEmpty().withMessage('ID Produk harus diisi')
        .isUUID().withMessage('ID Produk harus berupa UUID'),
    body('items.*.stok_fisik')
        .notEmpty().withMessage('Stok fisik harus diisi')
        .isInt({ min: 0 }).withMessage('Stok fisik harus berupa angka positif'),
    body('items.*.keterangan')
        .optional()
        .isString().withMessage('Keterangan item harus berupa string')
];

const updateStockOpnameValidation = [
    body('opname_number')
        .optional()
        .isString().withMessage('Nomor opname harus berupa string'),
    body('tanggal')
        .optional()
        .isISO8601().withMessage('Format tanggal tidak valid'),
    body('status')
        .optional()
        .isIn(['DRAFT', 'COMPLETED']).withMessage('Status tidak valid'),
    body('items')
        .optional()
        .isArray({ min: 1 }).withMessage('Minimal harus ada satu produk'),
    body('items.*.product_id')
        .notEmpty().withMessage('ID Produk harus diisi')
        .isUUID().withMessage('ID Produk harus berupa UUID'),
    body('items.*.stok_fisik')
        .notEmpty().withMessage('Stok fisik harus diisi')
        .isInt({ min: 0 }).withMessage('Stok fisik harus berupa angka positif'),
    body('items.*.keterangan')
        .optional()
        .isString().withMessage('Keterangan item harus berupa string')
];

module.exports = {
    createStockOpnameValidation,
    updateStockOpnameValidation
};
