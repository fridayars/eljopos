const db = require('../models');
const AppError = require('../utils/app.error');
const logger = require('../utils/logger.util');
const { insertMutasiStok } = require('../utils/mutasiStok.helper');
const { JENIS_MUTASI_STOK } = require('../utils/enums');
const { StockOpname, StockOpnameDetail, Product, User, Store } = db;

/**
 * Create a new Stock Opname session
 * @param {object} data {opname_number, tanggal, keterangan, status, items: [{product_id, stok_fisik, keterangan}]}
 * @param {string} storeId
 * @param {string} userId
 */
const createStockOpname = async (data, storeId, userId) => {
    const transaction = await db.sequelize.transaction();
    try {
        const { opname_number, tanggal, keterangan, status, items } = data;

        // Check for duplicate opname_number
        const existing = await StockOpname.findOne({ where: { opname_number }, transaction });
        if (existing) {
            throw new AppError('Opname number already exists', 400);
        }

        const opnameStatus = (status === 'COMPLETED') ? 'COMPLETED' : 'DRAFT';

        const stockOpname = await StockOpname.create({
            opname_number,
            store_id: storeId,
            user_id: userId,
            tanggal: tanggal || new Date(),
            status: opnameStatus,
            keterangan
        }, { transaction });

        const mutasiData = [];
        if (items && items.length > 0) {
            const detailData = [];
            for (const item of items) {
                const product = await Product.findByPk(item.product_id, { transaction });
                if (!product) {
                    throw new AppError(`Product with ID ${item.product_id} not found`, 404);
                }

                const stok_sistem = product.stock;
                const stok_fisik = item.stok_fisik;
                const selisih = stok_fisik - stok_sistem;

                detailData.push({
                    stock_opname_id: stockOpname.id,
                    product_id: item.product_id,
                    stok_sistem,
                    stok_fisik,
                    selisih,
                    keterangan: item.keterangan
                });

                if (opnameStatus === 'COMPLETED') {
                    // Update product stock immediately
                    product.stock = stok_fisik;
                    await product.save({ transaction });

                    // Add to mutasi data if there's a difference
                    if (selisih !== 0) {
                        mutasiData.push({
                            product_id: item.product_id,
                            jenis_mutasi: JENIS_MUTASI_STOK.STOK_OPNAME,
                            stok: selisih,
                            reference_id: stockOpname.id,
                            keterangan: `Stok Opname ${stockOpname.opname_number}: ${item.keterangan || '-'}`
                        });
                    }
                }
            }
            await StockOpnameDetail.bulkCreate(detailData, { transaction });
        }

        // Batch insert mutasi stok if completed
        if (opnameStatus === 'COMPLETED' && mutasiData.length > 0) {
            await insertMutasiStok(mutasiData, { transaction });
        }

        await transaction.commit();
        return stockOpname;
    } catch (error) {
        await transaction.rollback();
        logger.error({ type: 'create_stock_opname_failed', message: error.message, stack: error.stack });
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to create stock opname: ' + error.message, 500);
    }
};

/**
 * Get all Stock Opnames with pagination and search
 */
const getAllStockOpnames = async (opts, storeId) => {
    try {
        const page = opts.page || 1;
        const limit = opts.limit || 10;
        const offset = (page - 1) * limit;
        const where = { store_id: storeId };

        if (opts.search) {
            const Sequelize = db.Sequelize;
            where.opname_number = { [Sequelize.Op.iLike]: `%${opts.search}%` };
        }

        if (opts.status) {
            where.status = opts.status;
        }

        const { count, rows } = await StockOpname.findAndCountAll({
            where,
            include: [
                { model: User, as: 'user', attributes: ['username'] }
            ],
            order: [['created_at', 'DESC']],
            limit,
            offset
        });

        return {
            items: rows,
            pagination: {
                page,
                limit,
                total: count,
                total_pages: Math.ceil(count / limit)
            }
        };
    } catch (error) {
        logger.error({ type: 'get_all_stock_opnames_failed', message: error.message, stack: error.stack });
        throw new AppError('Failed to fetch stock opnames: ' + error.message, 500);
    }
};

/**
 * Get Stock Opname by ID with details
 */
const getStockOpnameById = async (id, storeId) => {
    try {
        const stockOpname = await StockOpname.findOne({
            where: { id, store_id: storeId },
            include: [
                { model: User, as: 'user', attributes: ['username'] },
                {
                    model: StockOpnameDetail,
                    as: 'details',
                    include: [{ model: Product, as: 'product', attributes: ['name', 'sku'] }]
                }
            ]
        });

        if (!stockOpname) {
            throw new AppError('Stock opname not found', 404);
        }

        return stockOpname;
    } catch (error) {
        logger.error({ type: 'get_stock_opname_failed', message: error.message, stack: error.stack });
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to fetch stock opname: ' + error.message, 500);
    }
};

/**
 * Complete a Stock Opname session (Update stocks and record mutations)
 */
const completeStockOpname = async (id, storeId) => {
    const transaction = await db.sequelize.transaction();
    try {
        const stockOpname = await StockOpname.findOne({
            where: { id, store_id: storeId, status: 'DRAFT' },
            include: [{ model: StockOpnameDetail, as: 'details' }],
            transaction
        });

        if (!stockOpname) {
            throw new AppError('Draft stock opname not found', 404);
        }

        const details = stockOpname.details;
        const mutasiData = [];

        for (const detail of details) {
            // Update product stock
            const product = await Product.findByPk(detail.product_id, { transaction });
            if (product) {
                // Update product stock directly to stok_fisik
                product.stock = detail.stok_fisik;
                await product.save({ transaction });

                // Add to mutasi data if there's a difference
                if (detail.selisih !== 0) {
                    mutasiData.push({
                        product_id: detail.product_id,
                        jenis_mutasi: JENIS_MUTASI_STOK.STOK_OPNAME,
                        stok: detail.selisih,
                        reference_id: stockOpname.id,
                        keterangan: `Stok Opname ${stockOpname.opname_number}: ${detail.keterangan || 'Penyesuaian otomatis'}`
                    });
                }
            }
        }

        // Batch insert mutasi stok
        if (mutasiData.length > 0) {
            await insertMutasiStok(mutasiData, { transaction });
        }

        // Mark as completed
        stockOpname.status = 'COMPLETED';
        await stockOpname.save({ transaction });

        await transaction.commit();
        return stockOpname;
    } catch (error) {
        await transaction.rollback();
        logger.error({ type: 'complete_stock_opname_failed', message: error.message, stack: error.stack });
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to complete stock opname: ' + error.message, 500);
    }
};

/**
 * Cancel a Stock Opname session
 */
const cancelStockOpname = async (id, storeId) => {
    try {
        const stockOpname = await StockOpname.findOne({
            where: { id, store_id: storeId, status: 'DRAFT' }
        });

        if (!stockOpname) {
            throw new AppError('Draft stock opname not found', 404);
        }

        stockOpname.status = 'CANCELLED';
        await stockOpname.save();

        return stockOpname;
    } catch (error) {
        logger.error({ type: 'cancel_stock_opname_failed', message: error.message, stack: error.stack });
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to cancel stock opname: ' + error.message, 500);
    }
};

/**
 * Update a Stock Opname session (only if DRAFT)
 * @param {string} id
 * @param {object} data {opname_number, tanggal, keterangan, status, items: [{product_id, stok_fisik, keterangan}]}
 * @param {string} storeId
 */
const updateStockOpname = async (id, data, storeId) => {
    const transaction = await db.sequelize.transaction();
    try {
        const stockOpname = await StockOpname.findOne({
            where: { id, store_id: storeId, status: 'DRAFT' },
            transaction
        });

        if (!stockOpname) {
            throw new AppError('Draft stock opname not found or cannot be edited', 404);
        }

        const { opname_number, tanggal, keterangan, status, items } = data;

        // Check for duplicate opname_number if changed
        if (opname_number && opname_number !== stockOpname.opname_number) {
            const existing = await StockOpname.findOne({ where: { opname_number }, transaction });
            if (existing) {
                throw new AppError('Opname number already exists', 400);
            }
            stockOpname.opname_number = opname_number;
        }

        if (tanggal) stockOpname.tanggal = tanggal;
        if (keterangan !== undefined) stockOpname.keterangan = keterangan;

        const newStatus = (status === 'COMPLETED') ? 'COMPLETED' : 'DRAFT';
        stockOpname.status = newStatus;

        await stockOpname.save({ transaction });

        const mutasiData = [];
        if (items && items.length > 0) {
            // Delete old details
            await StockOpnameDetail.destroy({ where: { stock_opname_id: id }, transaction });

            const detailData = [];
            for (const item of items) {
                const product = await Product.findByPk(item.product_id, { transaction });
                if (!product) {
                    throw new AppError(`Product with ID ${item.product_id} not found`, 404);
                }

                const stok_sistem = product.stock;
                const stok_fisik = item.stok_fisik;
                const selisih = stok_fisik - stok_sistem;

                detailData.push({
                    stock_opname_id: id,
                    product_id: item.product_id,
                    stok_sistem,
                    stok_fisik,
                    selisih,
                    keterangan: item.keterangan
                });

                if (newStatus === 'COMPLETED') {
                    // Update product stock immediately
                    product.stock = stok_fisik;
                    await product.save({ transaction });

                    // Add to mutasi data if there's a difference
                    if (selisih !== 0) {
                        mutasiData.push({
                            product_id: item.product_id,
                            jenis_mutasi: JENIS_MUTASI_STOK.STOK_OPNAME,
                            stok: selisih,
                            reference_id: stockOpname.id,
                            keterangan: `Stok Opname ${stockOpname.opname_number}: ${item.keterangan || '-'}`
                        });
                    }
                }
            }
            await StockOpnameDetail.bulkCreate(detailData, { transaction });
        }

        // Batch insert mutasi stok if completed
        if (newStatus === 'COMPLETED' && mutasiData.length > 0) {
            await insertMutasiStok(mutasiData, { transaction });
        }

        await transaction.commit();
        return stockOpname;
    } catch (error) {
        await transaction.rollback();
        logger.error({ type: 'update_stock_opname_failed', message: error.message, stack: error.stack });
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to update stock opname: ' + error.message, 500);
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
