const { Op } = require('sequelize');
const db = require('../models');
const AppError = require('../utils/app.error');
const logger = require('../utils/logger.util');

const Store = db.Store;

/**
 * Get all active stores (dropdown)
 * @returns {Promise<Array>} List of stores with id, name, and address
 */
const getAllStores = async () => {
    const stores = await Store.findAll({
        where: {
            is_active: true
        },
        attributes: ['id', 'name', 'address'],
        order: [['name', 'ASC']]
    });

    return stores.map(s => ({
        id: s.id,
        name: s.name,
        address: s.address
    }));
};

/**
 * Get all stores with pagination and search
 */
const getStores = async (query) => {
    try {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;
        const offset = (page - 1) * limit;

        const whereClause = {};

        if (query.search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${query.search}%` } },
                { address: { [Op.like]: `%${query.search}%` } },
                { phone: { [Op.like]: `%${query.search}%` } }
            ];
        }

        const { count, rows } = await Store.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [['created_at', 'DESC']]
        });

        return {
            total_items: count,
            total_pages: Math.ceil(count / limit),
            current_page: page,
            limit,
            items: rows
        };
    } catch (error) {
        logger.error({
            type: 'get_stores_failed',
            message: error.message,
            stack: error.stack
        });
        throw new AppError('Gagal mengambil data cabang: ' + error.message, 500);
    }
};

/**
 * Create new store
 */
const createStore = async (payload) => {
    try {
        const { name, address, phone, notes } = payload;

        const existingStore = await Store.findOne({ where: { name } });
        if (existingStore) {
            throw new AppError('Nama cabang sudah digunakan', 400);
        }

        const newStore = await Store.create({
            name,
            address,
            phone,
            notes,
            is_active: true
        });

        logger.info({
            type: 'store_created',
            store_id: newStore.id,
            name: newStore.name
        });

        return newStore;
    } catch (error) {
        logger.error({
            type: 'create_store_failed',
            message: error.message,
            stack: error.stack,
            payload
        });
        if (error instanceof AppError) throw error;
        throw new AppError('Gagal membuat cabang: ' + error.message, 500);
    }
};

/**
 * Update store
 */
const updateStore = async (id, payload) => {
    try {
        const { name, address, phone, notes } = payload;
        
        const store = await Store.findByPk(id);
        if (!store) {
            throw new AppError('Cabang tidak ditemukan', 404);
        }

        if (name && name !== store.name) {
            const existingStore = await Store.findOne({ where: { name } });
            if (existingStore) {
                throw new AppError('Nama cabang sudah digunakan', 400);
            }
            store.name = name;
        }

        if (address !== undefined) store.address = address;
        if (phone !== undefined) store.phone = phone;
        if (notes !== undefined) store.notes = notes;

        await store.save();

        logger.info({
            type: 'store_updated',
            target_store_id: store.id
        });

        return store;
    } catch (error) {
        logger.error({
            type: 'update_store_failed',
            target_store_id: id,
            message: error.message,
            stack: error.stack
        });
        if (error instanceof AppError) throw error;
        throw new AppError('Gagal memperbarui cabang: ' + error.message, 500);
    }
};

/**
 * Toggle store status (is_active)
 */
const toggleStoreStatus = async (id) => {
    try {
        const store = await Store.findByPk(id);
        if (!store) {
            throw new AppError('Cabang tidak ditemukan', 404);
        }

        store.is_active = !store.is_active;
        await store.save();

        logger.info({
            type: 'store_status_toggled',
            target_store_id: store.id,
            is_active: store.is_active
        });

        return {
            id: store.id,
            is_active: store.is_active
        };
    } catch (error) {
        logger.error({
            type: 'toggle_store_status_failed',
            target_store_id: id,
            message: error.message,
            stack: error.stack
        });
        if (error instanceof AppError) throw error;
        throw new AppError('Gagal mengubah status cabang: ' + error.message, 500);
    }
};

/**
 * Delete store (soft delete)
 */
const deleteStore = async (id) => {
    try {
        const store = await Store.findByPk(id);
        if (!store) {
            throw new AppError('Cabang tidak ditemukan', 404);
        }

        await store.destroy(); // Soft delete because of paranoid: true

        logger.info({
            type: 'store_deleted',
            target_store_id: store.id
        });

        return { message: 'Cabang berhasil dihapus' };
    } catch (error) {
        logger.error({
            type: 'delete_store_failed',
            target_store_id: id,
            message: error.message,
            stack: error.stack
        });
        if (error instanceof AppError) throw error;
        throw new AppError('Gagal menghapus cabang: ' + error.message, 500);
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
