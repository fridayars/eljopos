const storeService = require('../services/store.service');

/**
 * Get all active stores (dropdown) — GET /api/master/stores/active
 */
const getAllStores = async (req, res, next) => {
    try {
        const stores = await storeService.getAllStores();
        return res.json({ success: true, data: stores });
    } catch (error) {
        next(error);
    }
};

const getStores = async (req, res, next) => {
    try {
        const data = await storeService.getStores(req.query);
        return res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

const createStore = async (req, res, next) => {
    try {
        const data = await storeService.createStore(req.body);
        return res.status(201).json({ success: true, data, message: 'Cabang berhasil dibuat' });
    } catch (error) {
        next(error);
    }
};

const updateStore = async (req, res, next) => {
    try {
        const data = await storeService.updateStore(req.params.id, req.body);
        return res.json({ success: true, data, message: 'Cabang berhasil diperbarui' });
    } catch (error) {
        next(error);
    }
};

const toggleStoreStatus = async (req, res, next) => {
    try {
        const data = await storeService.toggleStoreStatus(req.params.id);
        return res.json({ success: true, data, message: 'Status cabang berhasil diubah' });
    } catch (error) {
        next(error);
    }
};

const deleteStore = async (req, res, next) => {
    try {
        const data = await storeService.deleteStore(req.params.id);
        return res.json({ success: true, data, message: 'Cabang berhasil dihapus' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllStores,
    getStores,
    createStore,
    updateStore,
    toggleStoreStatus,
    deleteStore
};
