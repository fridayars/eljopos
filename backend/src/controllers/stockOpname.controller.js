const stockOpnameService = require('../services/stockOpname.service');

const createStockOpname = async (req, res, next) => {
    try {
        const storeId = req.user.store_id;
        const userId = req.user.user_id;
        const data = req.body;

        const result = await stockOpnameService.createStockOpname(data, storeId, userId);

        return res.status(201).json({ success: true, data: result, message: 'Stock opname created successfully' });
    } catch (error) {
        next(error);
    }
};

const getAllStockOpnames = async (req, res, next) => {
    try {
        const storeId = req.user.store_id;
        const opts = {
            page: parseInt(req.query.page, 10) || 1,
            limit: parseInt(req.query.limit, 10) || 10,
            search: req.query.search,
            status: req.query.status
        };

        const result = await stockOpnameService.getAllStockOpnames(opts, storeId);

        return res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

const getStockOpnameById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const storeId = req.user.store_id;

        const result = await stockOpnameService.getStockOpnameById(id, storeId);

        return res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

const completeStockOpname = async (req, res, next) => {
    try {
        const { id } = req.params;
        const storeId = req.user.store_id;

        const result = await stockOpnameService.completeStockOpname(id, storeId);

        return res.json({ success: true, data: result, message: 'Stock opname completed successfully' });
    } catch (error) {
        next(error);
    }
};

const cancelStockOpname = async (req, res, next) => {
    try {
        const { id } = req.params;
        const storeId = req.user.store_id;

        const result = await stockOpnameService.cancelStockOpname(id, storeId);

        return res.json({ success: true, data: result, message: 'Stock opname cancelled successfully' });
    } catch (error) {
        next(error);
    }
};

const updateStockOpname = async (req, res, next) => {
    try {
        const { id } = req.params;
        const storeId = req.user.store_id;
        const data = req.body;

        const result = await stockOpnameService.updateStockOpname(id, data, storeId);

        return res.json({ success: true, data: result, message: 'Stock opname updated successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createStockOpname,
    getAllStockOpnames,
    getStockOpnameById,
    completeStockOpname,
    cancelStockOpname,
    updateStockOpname
};
