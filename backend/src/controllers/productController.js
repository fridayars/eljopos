const productService = require('../services/productService');
const db = require('../models');
const { Store } = db;

/**
 * Export Products to Excel — GET /api/master/products/export
 */
const exportProducts = async (req, res, next) => {
    try {
        // Priority: query params store_id, then fallback to req.user.store_id
        const storeId = req.query.store_id || req.user.store_id;

        if (!storeId) {
            return res.status(400).json({
                success: false,
                message: 'store_id is required for export'
            });
        }

        // Fetch store name for filename
        const store = await Store.findByPk(storeId, { attributes: ['name'] });
        const storeName = store ? store.name.replace(/\s+/g, '_').toLowerCase() : 'unknown';

        const buffer = await productService.exportProducts(storeId);

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `products_${storeName}_${timestamp}.xlsx`;

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

        return res.send(buffer);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    exportProducts
};
