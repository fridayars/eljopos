const dashboardService = require('../services/dashboard.service');

/**
 * GET /api/dashboard/summary
 */
const getSummary = async (req, res, next) => {
    try {
        const storeId = req.query.store_id || req.user.store_id;
        const result = await dashboardService.getDashboardSummary(storeId);

        return res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/dashboard/recent-transactions
 */
const getRecentTransactions = async (req, res, next) => {
    try {
        const storeId = req.query.store_id || req.user.store_id;
        const result = await dashboardService.getRecentTransactions(storeId);

        return res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/dashboard/notes
 */
const updateNotes = async (req, res, next) => {
    try {
        const storeId = req.body.store_id || req.user.store_id;
        const { notes } = req.body;

        const result = await dashboardService.updateStoreNotes(storeId, notes || '');

        return res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getSummary, getRecentTransactions, updateNotes };
