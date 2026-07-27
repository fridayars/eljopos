const db = require('../models');
const { KategoriArusUang } = db;
const AppError = require('../utils/app.error');

const getAll = async (store_id, type) => {
    const where = { is_active: true };
    if (type) {
        where.type = type;
    }
    return await KategoriArusUang.findAll({
        where,
        order: [['name', 'ASC']]
    });
};

const create = async (store_id, data) => {
    const exists = await KategoriArusUang.findOne({
        where: { type: data.type, name: data.name }
    });
    
    if (exists) {
        throw new AppError('Kategori sudah ada', 400);
    }
    
    return await KategoriArusUang.create({
        store_id,
        type: data.type,
        name: data.name,
        description: data.description || null
    });
};

module.exports = {
    getAll,
    create
};
