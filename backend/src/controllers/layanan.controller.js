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

        const storeId = req.query.store_id || req.user.store_id;

        if (!storeId) {
            return res.status(400).json({ success: false, message: 'store_id is required' });
        }

        const result = await layananService.getAllServices({ page, limit, search, sort, kategori_layanan_id }, storeId);

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

module.exports = {
    getAllServices,
    getServiceCategories
};
