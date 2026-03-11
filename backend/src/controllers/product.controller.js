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
        const filename = `product_${storeName}_${timestamp}.xlsx`;

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
        const status = req.query.status;
        const kategori_id = req.query.kategori_id;

        const storeId = req.query.store_id || req.user.store_id;

        if (!storeId) {
            return res.status(400).json({ success: false, message: 'store_id is required' });
        }

        const result = await productService.getAllProducts({ page, limit, search, sort, status, kategori_id }, storeId);

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

/**
 * Create Product Category
 */
const createCategory = async (req, res, next) => {
    try {
        const data = req.body;
        const category = await productService.createCategory(data);
        return res.status(201).json({ success: true, data: category, message: 'Category created successfully' });
    } catch (error) {
        next(error);
    }
};

/**
 * Update Product Category
 */
const updateCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const category = await productService.updateCategory(id, data);
        return res.json({ success: true, data: category, message: 'Category updated successfully' });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete Product Category
 */
const deleteCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        await productService.deleteCategory(id);
        return res.json({ success: true, message: 'Category deleted successfully' });
    } catch (error) {
        next(error);
    }
};

/**
 * Create Product
 */
const createProduct = async (req, res, next) => {
    try {
        const storeId = req.query.store_id || req.user.store_id;

        if (!storeId) {
            return res.status(400).json({ success: false, message: 'store_id is required' });
        }

        const data = req.body;
        const product = await productService.createProduct(data, storeId);

        return res.status(201).json({ success: true, data: product, message: 'Product created successfully' });
    } catch (error) {
        next(error);
    }
};

/**
 * Update Product
 */
const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const storeId = req.query.store_id || req.user.store_id;

        if (!storeId) {
            return res.status(400).json({ success: false, message: 'store_id is required' });
        }

        const data = req.body;
        const product = await productService.updateProduct(id, data, storeId);

        return res.json({ success: true, data: product, message: 'Product updated successfully' });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete Product (Soft delete)
 */
const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const storeId = req.query.store_id || req.user.store_id;

        if (!storeId) {
            return res.status(400).json({ success: false, message: 'store_id is required' });
        }

        const result = await productService.deleteProduct(id, storeId);

        return res.json({ success: true, message: result.message });
    } catch (error) {
        next(error);
    }
};

/**
 * Update Product Status
 */
const updateProductStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const storeId = req.query.store_id || req.user.store_id;

        if (!storeId) {
            return res.status(400).json({ success: false, message: 'store_id is required' });
        }

        const { is_active } = req.body;

        if (is_active === undefined) {
            return res.status(400).json({ success: false, message: 'is_active is required' });
        }

        const result = await productService.updateProductStatus(id, is_active, storeId);

        return res.json({ success: true, message: result.message });
    } catch (error) {
        next(error);
    }
};

/**
 * Transfer Stock
 */
const transferStock = async (req, res, next) => {
    try {
        const userId = req.user.user_id;
        const data = req.body;

        const result = await productService.transferStock(data, userId);

        return res.json({ success: true, message: result.message });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    exportProducts,
    getAllProducts,
    importProducts,
    getProductCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    createProduct,
    updateProduct,
    deleteProduct,
    updateProductStatus,
    transferStock
};
