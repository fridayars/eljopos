const tipeHpService = require('../services/tipeHp.service');

const getAllTipeHp = async (req, res, next) => {
    try {
        const search = req.query.search;
        const result = await tipeHpService.getAllTipeHp({ search });
        return res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

const createTipeHp = async (req, res, next) => {
    try {
        const result = await tipeHpService.createTipeHp(req.body);
        return res.status(201).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

module.exports = { getAllTipeHp, createTipeHp };
