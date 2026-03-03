const db = require('../models');
const { Transaksi, TransaksiDetail, TransaksiPayment, Product, Customer, Store, sequelize } = db;
const AppError = require('../utils/app.error');
const logger = require('../utils/logger.util');
const { Op, fn, col, literal } = require('sequelize');

/**
 * Helper: get start and end of a given date (default today)
 */
const getDayRange = (date = new Date()) => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return { start, end };
};

/**
 * Dashboard Summary — GET /api/dashboard/summary
 * Statistik hari ini vs kemarin
 */
const getDashboardSummary = async (storeId) => {
    try {
        const today = getDayRange();
        const yesterday = getDayRange(new Date(Date.now() - 86400000));

        // --- Build store filter ---
        const storeFilter = storeId ? { store_id: storeId } : {};

        // 1. Sales & Transactions — today
        const todayStats = await Transaksi.findOne({
            where: {
                ...storeFilter,
                created_at: { [Op.between]: [today.start, today.end] }
            },
            attributes: [
                [fn('COALESCE', fn('SUM', col('total_amount')), 0), 'total_sales'],
                [fn('COUNT', col('id')), 'total_transactions']
            ],
            raw: true
        });

        // 2. Sales & Transactions — yesterday
        const yesterdayStats = await Transaksi.findOne({
            where: {
                ...storeFilter,
                created_at: { [Op.between]: [yesterday.start, yesterday.end] }
            },
            attributes: [
                [fn('COALESCE', fn('SUM', col('total_amount')), 0), 'total_sales'],
                [fn('COUNT', col('id')), 'total_transactions']
            ],
            raw: true
        });

        // 3. New Customers — today vs yesterday
        const todayCustomers = await Customer.count({
            where: {
                created_at: { [Op.between]: [today.start, today.end] }
            }
        });

        const yesterdayCustomers = await Customer.count({
            where: {
                created_at: { [Op.between]: [yesterday.start, yesterday.end] }
            }
        });

        // 4. Low stock items (stock < 10) — today vs yesterday
        const todayLowStock = await Product.count({
            where: {
                ...storeFilter,
                stock: { [Op.lt]: 10 },
                is_active: true
            }
        });

        const yesterdayLowStock = await Product.count({
            where: {
                ...storeFilter,
                stock: { [Op.lt]: 10 },
                is_active: true,
                created_at: { [Op.lte]: yesterday.end }
            }
        });

        // 5. Store notes
        let notes = '';
        if (storeId) {
            const store = await Store.findByPk(storeId, { attributes: ['notes'] });
            notes = store?.notes || '';
        }

        // --- Calculate changes ---
        const calcChange = (current, previous) => {
            if (previous === 0) return current > 0 ? '+100%' : '0%';
            const change = ((current - previous) / previous) * 100;
            const sign = change >= 0 ? '+' : '';
            return `${sign}${change.toFixed(1)}%`;
        };

        const todaySales = parseFloat(todayStats.total_sales) || 0;
        const yesterdaySales = parseFloat(yesterdayStats.total_sales) || 0;
        const todayTrx = parseInt(todayStats.total_transactions, 10) || 0;
        const yesterdayTrx = parseInt(yesterdayStats.total_transactions, 10) || 0;

        const lowStockDiff = todayLowStock - yesterdayLowStock;
        const lowStockSign = lowStockDiff >= 0 ? '+' : '';

        return {
            today_sales: todaySales,
            total_transactions: todayTrx,
            total_new_customers: todayCustomers,
            low_stock_items: todayLowStock,
            sales_change: calcChange(todaySales, yesterdaySales),
            transactions_change: calcChange(todayTrx, yesterdayTrx),
            new_customers_change: calcChange(todayCustomers, yesterdayCustomers),
            low_stock_change: `${lowStockSign}${lowStockDiff}`,
            notes
        };
    } catch (error) {
        if (error instanceof AppError) throw error;

        logger.error({
            type: 'dashboard_summary_failed',
            message: error.message
        });

        throw new AppError('Failed to get dashboard summary', 500);
    }
};

/**
 * Recent Transactions — GET /api/dashboard/recent-transactions
 * 5 transaksi terbaru hari ini
 */
const getRecentTransactions = async (storeId) => {
    try {
        const storeFilter = storeId ? { store_id: storeId } : {};

        const transactions = await Transaksi.findAll({
            where: { ...storeFilter, created_at: { [Op.gte]: new Date().setHours(0, 0, 0, 0) } },
            attributes: ['id', 'receipt_number', 'total_amount', 'created_at'],
            include: [
                {
                    model: Customer,
                    as: 'customer',
                    attributes: ['name']
                },
                {
                    model: TransaksiPayment,
                    as: 'payments',
                    attributes: ['payment_method']
                },
                {
                    model: TransaksiDetail,
                    as: 'details',
                    attributes: ['id']
                }
            ],
            order: [['created_at', 'DESC']],
            limit: 5
        });

        return transactions.map(trx => ({
            id: trx.id,
            invoice_number: trx.receipt_number,
            created_at: trx.created_at,
            customer_name: trx.customer ? trx.customer.name : null,
            total_amount: trx.total_amount,
            payment_method: [...new Set(trx.payments.map(p => p.payment_method))],
            items_count: trx.details ? trx.details.length : 0
        }));
    } catch (error) {
        if (error instanceof AppError) throw error;

        logger.error({
            type: 'recent_transactions_failed',
            message: error.message
        });

        throw new AppError('Failed to get recent transactions', 500);
    }
};

/**
 * Update Store Notes — PUT /api/dashboard/notes
 */
const updateStoreNotes = async (storeId, notes) => {
    try {
        const store = await Store.findByPk(storeId);

        if (!store) {
            throw new AppError('Store not found', 404);
        }

        store.notes = notes;
        await store.save();

        return { store_id: storeId, notes: store.notes };
    } catch (error) {
        if (error instanceof AppError) throw error;

        logger.error({
            type: 'update_store_notes_failed',
            message: error.message,
            store_id: storeId
        });

        throw new AppError('Failed to update store notes', 500);
    }
};

module.exports = { getDashboardSummary, getRecentTransactions, updateStoreNotes };
