const db = require('../models');
const { ArusUang, Transaksi, TransaksiPayment, User, sequelize } = db;
const AppError = require('../utils/app.error');
const logger = require('../utils/logger.util');
const { Op, fn, col } = require('sequelize');

const getListArusUang = async ({ store_id, start_date, end_date, type, page = 1, limit = 20 }) => {
    try {
        const offset = (page - 1) * limit;
        const whereClause = { store_id };

        if (start_date && end_date) {
            whereClause.date = {
                [Op.between]: [
                    new Date(`${start_date}T00:00:00`),
                    new Date(`${end_date}T23:59:59`)
                ]
            };
        }

        if (type && ['IN', 'OUT'].includes(type.toUpperCase())) {
            whereClause.type = type.toUpperCase();
        }

        // Summary Calculations
        const summaryArr = await ArusUang.findAll({
            where: whereClause,
            attributes: [
                'type',
                [fn('SUM', col('amount')), 'total']
            ],
            group: ['type'],
            raw: true
        });

        let totalIn = 0;
        let totalOut = 0;
        summaryArr.forEach(item => {
            if (item.type === 'IN') totalIn = parseFloat(item.total) || 0;
            if (item.type === 'OUT') totalOut = parseFloat(item.total) || 0;
        });

        // List
        const { count, rows } = await ArusUang.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User, // Need to add 'user' association to ArusUang model later or just rely on manual query
                    as: 'creator',
                    attributes: ['username']
                }
            ],
            order: [['date', 'DESC'], ['created_at', 'DESC']],
            limit,
            offset
        });

        return {
            summary: {
                total_in: totalIn,
                total_out: totalOut,
                current_balance: totalIn - totalOut // Can be used for period balance
            },
            items: rows,
            meta: {
                page,
                limit,
                total: count,
                total_pages: Math.ceil(count / limit)
            }
        };
    } catch (error) {
        logger.error({ type: 'get_list_arus_uang_failed', message: error.message });
        throw new AppError('Failed to fetch cash flow list', 500);
    }
};

const createArusUangManual = async (data) => {
    try {
        const result = await ArusUang.create({
            store_id: data.store_id,
            type: data.type,
            source: 'MANUAL',
            reference_id: null,
            payment_method: data.payment_method,
            amount: data.amount,
            description: data.description,
            date: data.date,
            created_by: data.created_by
        });

        return result;
    } catch (error) {
        logger.error({ type: 'create_arus_uang_manual_failed', message: error.message });
        throw new AppError('Failed to create manual cash flow', 500);
    }
};

const deleteArusUangManual = async (id) => {
    try {
        const arusUang = await ArusUang.findByPk(id);

        if (!arusUang) {
            throw new AppError('Cash flow record not found', 404);
        }

        if (arusUang.source !== 'MANUAL') {
            throw new AppError('Only manual cash flow records can be deleted directly. System generated records must be deleted from their origin module.', 403);
        }

        await arusUang.destroy();
        return true;
    } catch (error) {
        if (error instanceof AppError) throw error;
        logger.error({ type: 'delete_arus_uang_manual_failed', message: error.message });
        throw new AppError('Failed to delete manual cash flow', 500);
    }
};

const syncArusUang = async (userId) => {
    // This function acts as a one-time migration or manual trigger to sync older Transaksi into Arus Uang.
    const t = await sequelize.transaction();
    try {
        // Find transactions and their payments that aren't soft deleted
        const transaksiList = await Transaksi.findAll({
            include: [{
                model: TransaksiPayment,
                as: 'payments'
            }],
            transaction: t
        });

        let syncedCount = 0;

        for (const trx of transaksiList) {
            // Check if this transaction already exists in Arus Uang
            const exists = await ArusUang.findOne({
                where: { reference_id: trx.id, source: 'TRANSAKSI' },
                transaction: t
            });

            if (exists) continue; // Skip if already synced

            if (trx.payments && trx.payments.length > 0) {
                // Determine if we need to adjust cash for change
                let totalGrossPayment = trx.payments.reduce((acc, curr) => acc + parseFloat(curr.nominal), 0);
                const totalRevenue = parseFloat(trx.total_amount);
                const totalChange = totalGrossPayment - totalRevenue;
                
                // Copy the array to manipulate it
                let paymentsToSync = trx.payments.map(p => ({
                    method: p.payment_method,
                    nominal: parseFloat(p.nominal)
                }));

                // Deduct change from CASH if exists, similar to getLaporanPenjualan
                if (totalChange > 0 && paymentsToSync.length > 0) {
                    let cashMethod = paymentsToSync.find(p => 
                        p.method.toLowerCase() === 'cash' || p.method.toLowerCase() === 'tunai'
                    );
                    if (cashMethod) {
                        cashMethod.nominal -= totalChange;
                    } else {
                        // Normally change is given in cash, but if not, deduct from first
                        paymentsToSync.sort((a, b) => b.nominal - a.nominal);
                        paymentsToSync[0].nominal -= totalChange;
                    }
                }

                const records = paymentsToSync.map(p => ({
                    store_id: trx.store_id,
                    type: 'IN',
                    source: 'TRANSAKSI',
                    reference_id: trx.id,
                    payment_method: p.method,
                    amount: p.nominal,
                    description: `Penjualan ${trx.receipt_number}`,
                    date: trx.created_at,
                    created_by: trx.user_id || userId,
                    created_at: trx.created_at,
                    updated_at: trx.created_at
                }));

                await ArusUang.bulkCreate(records, { transaction: t });
                syncedCount += records.length;
            }
        }

        await t.commit();
        logger.info({ type: 'sync_arus_uang_success', count: syncedCount });

        return { synced_records: syncedCount };
    } catch (error) {
        await t.rollback();
        logger.error({ type: 'sync_arus_uang_failed', message: error.message });
        throw new AppError('Failed to synchronize existing transactions', 500);
    }
};

module.exports = {
    getListArusUang,
    createArusUangManual,
    deleteArusUangManual,
    syncArusUang
};
