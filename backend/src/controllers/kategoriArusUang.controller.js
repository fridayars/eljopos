const kategoriArusUangService = require('../services/kategoriArusUang.service');

const getAll = async (req, res, next) => {
    try {
        const store_id = req.user.store_id;
        const { type } = req.query; // 'IN' or 'OUT'
        const data = await kategoriArusUangService.getAll(store_id, type);
        
        return res.json({
            success: true,
            data
        });
    } catch (error) {
        next(error);
    }
};

const create = async (req, res, next) => {
    try {
        const store_id = req.user.store_id;
        const data = await kategoriArusUangService.create(store_id, req.body);
        
        return res.status(201).json({
            success: true,
            data,
            message: 'Kategori arus uang berhasil dibuat'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAll,
    create
};
