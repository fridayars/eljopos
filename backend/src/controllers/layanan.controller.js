const layananService = require('../services/layanan.service');

/**
 * Get All Services — GET /api/master/layanan
 */
const getAllServices = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const search = req.query.search;
        const sort = req.query.sort;
        const kategori_layanan_id = req.query.kategori_layanan_id;
        const status = req.query.status;

        const storeId = req.query.store_id || req.user.store_id;

        if (!storeId) {
            return res.status(400).json({ success: false, message: 'store_id is required' });
        }

        const result = await layananService.getAllServices({ page, limit, search, sort, kategori_layanan_id, status }, storeId);

        return res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

/**
 * Get Service Categories — GET /api/master/layanan/categories
 */
const getServiceCategories = async (req, res, next) => {
    try {
        const search = req.query.search;
        const sort = req.query.sort;

        const items = await layananService.getServiceCategoriesList({ search, sort });

        return res.json({ success: true, data: { items } });
    } catch (error) {
        next(error);
    }
};

/**
 * Create Service Category — POST /api/master/layanan/categories
 */
const createServiceCategory = async (req, res, next) => {
    try {
        const result = await layananService.createServiceCategory(req.body);
        return res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

/**
 * Update Service Category — PUT /api/master/layanan/categories/:id
 */
const updateServiceCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await layananService.updateServiceCategory(id, req.body);
        return res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete Service Category — DELETE /api/master/layanan/categories/:id
 */
const deleteServiceCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await layananService.deleteServiceCategory(id);
        return res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

/**
 * Create Service — POST /api/master/layanan
 */
const createService = async (req, res, next) => {
    try {
        const storeId = req.body.store_id || req.query.store_id || req.user.store_id;

        if (!storeId) {
            return res.status(400).json({ success: false, message: 'store_id is required' });
        }

        const result = await layananService.createService(req.body, storeId);

        return res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

/**
 * Update Service — PUT /api/master/layanan/:id
 */
const updateService = async (req, res, next) => {
    try {
        const { id } = req.params;
        const storeId = req.body.store_id || req.query.store_id || req.user.store_id;

        if (!storeId) {
            return res.status(400).json({ success: false, message: 'store_id is required' });
        }

        const result = await layananService.updateService(id, req.body, storeId);

        return res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete Service — DELETE /api/master/layanan/:id
 */
const deleteService = async (req, res, next) => {
    try {
        const { id } = req.params;
        const storeId = req.query.store_id || req.user.store_id;

        if (!storeId) {
            return res.status(400).json({ success: false, message: 'store_id is required' });
        }

        const result = await layananService.deleteService(id, storeId);

        return res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

/**
 * Update Service Status — PUT /api/master/layanan/:id/status
 */
const updateServiceStatus = async (req, res, next) => {
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

        const result = await layananService.updateServiceStatus(id, is_active, storeId);

        return res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

/**
 * Get Service Detail — GET /api/master/layanan/:id
 */
const getServiceById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const storeId = req.query.store_id || req.user.store_id;

        if (!storeId) {
            return res.status(400).json({ success: false, message: 'store_id is required' });
        }

        const result = await layananService.getServiceById(id, storeId);

        return res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllServices,
    getServiceCategories,
    createServiceCategory,
    updateServiceCategory,
    deleteServiceCategory,
    createService,
    updateService,
    deleteService,
    updateServiceStatus,
    getServiceById
};
