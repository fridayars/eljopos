const storeService = require('../services/store.service');

/**
 * Get all active stores — GET /api/master/stores
 */
const getAllStores = async (req, res, next) => {
    try {
        const stores = await storeService.getAllStores();
        return res.json({ success: true, data: stores });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllStores
};
