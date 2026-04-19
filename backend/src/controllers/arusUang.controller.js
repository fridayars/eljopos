const arusUangService = require('../services/arusUang.service');

const getListArusUang = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const { start_date, end_date, type, store_id } = req.query;

        const result = await arusUangService.getListArusUang({
            store_id: store_id || req.user.store_id, // Default to user's store
            start_date,
            end_date,
            type,
            page,
            limit
        });

        return res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const createArusUangManual = async (req, res, next) => {
    try {
        const data = {
            ...req.body,
            store_id: req.user.store_id || req.body.store_id,
            source: 'MANUAL', // Force source
            created_by: req.user.user_id
        };

        const result = await arusUangService.createArusUangManual(data);

        return res.status(201).json({
            success: true,
            message: 'Manual cash flow recorded successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const syncArusUang = async (req, res, next) => {
    try {
        const result = await arusUangService.syncArusUang(req.user.user_id);

        return res.json({
            success: true,
            message: 'Transactions synchronized to Arus Uang ledger successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const deleteArusUangManual = async (req, res, next) => {
    try {
        await arusUangService.deleteArusUangManual(req.params.id);

        return res.json({
            success: true,
            message: 'Manual cash flow deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getListArusUang,
    createArusUangManual,
    syncArusUang,
    deleteArusUangManual
};
