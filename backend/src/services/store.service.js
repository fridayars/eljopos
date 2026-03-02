const db = require('../models');
const Store = db.Store;

/**
 * Get all active stores
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

module.exports = {
    getAllStores
};
