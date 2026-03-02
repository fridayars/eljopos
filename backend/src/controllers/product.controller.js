const productService = require('../services/product.service');
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
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        return res.send(buffer);
    } catch (error) {
        next(error);
    }
};
const importProducts = async (req, res, next) => {
    try {
        const storeId = req.query.store_id || req.user.store_id;

        if (!storeId) {
            return res.status(400).json({ success: false, message: 'store_id is required for import' });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'file is required' });
        }

        const result = await productService.importProducts(req.file.buffer, storeId, req.user);

        return res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

/**
 * Get All Products — GET /api/master/products
 */
const getAllProducts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const search = req.query.search;
        const sort = req.query.sort; // can be string or array

        const storeId = req.query.store_id || req.user.store_id;

        if (!storeId) {
            return res.status(400).json({ success: false, message: 'store_id is required' });
        }

        const result = await productService.getAllProducts({ page, limit, search, sort }, storeId);

        return res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

/**
 * Get Product Categories — GET /api/master/products/categories
 */
const getProductCategories = async (req, res, next) => {
    try {
        // No pagination for categories — return simple items list
        const search = req.query.search;
        const sort = req.query.sort;

        const items = await productService.getProductCategoriesList({ search, sort });

        return res.json({ success: true, data: { items } });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    exportProducts,
    getAllProducts,
    importProducts,
    getProductCategories
};
