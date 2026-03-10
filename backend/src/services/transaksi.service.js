const db = require('../models');
const { Transaksi, TransaksiDetail, TransaksiPayment, Product, Customer, User, Store, ProdukLayanan, sequelize } = db;
const AppError = require('../utils/app.error');
const logger = require('../utils/logger.util');
const { Op, fn, col, literal } = require('sequelize');

/**
 * Generate receipt number format: INV/YYYYMMDD/NNN
 * Auto-increment per hari
 */
const generateReceiptNumber = async (transaction) => {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `INV/${dateStr}/`;

    // Cari nomor terakhir hari ini
    const lastTransaksi = await Transaksi.findOne({
        where: {
            receipt_number: {
                [Op.like]: `${prefix}%`
            }
        },
        order: [['receipt_number', 'DESC']],
        paranoid: false, // termasuk soft-deleted agar nomor tidak duplikat
        transaction,
        lock: transaction.LOCK.UPDATE
    });

    let nextNumber = 1;
    if (lastTransaksi) {
        const lastNumber = parseInt(lastTransaksi.receipt_number.split('/').pop(), 10);
        nextNumber = lastNumber + 1;
    }

    return `${prefix}${String(nextNumber).padStart(3, '0')}`;
};

/**
 * Buat Transaksi (Kasir)
 * - Atomik: DB Transaction (start → commit/rollback)
 * - Validasi stok produk (FOR UPDATE lock untuk race condition)
 * - Kurangi stok produk
 * - Insert transaksi + detail + payments (split payment)
 */
const createTransaksi = async (data, userId) => {
    const t = await sequelize.transaction();

    try {
        const { store_id, customer_id, total_amount, subtotal, discount_type, discount, payment_method, items } = data;

        // 1. Validasi jika total_amount 0 (Strict Validation)
        if (parseFloat(total_amount) === 0) {
            const calculatedSubtotal = items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
            const isZeroPrice = calculatedSubtotal === 0;
            const isFullPercentageDiscount = discount_type === 'percentage' && parseFloat(discount) === 100;
            const isFullAmountDiscount = discount_type === 'amount' && parseFloat(discount) >= calculatedSubtotal;

            if (!isZeroPrice && !isFullPercentageDiscount && !isFullAmountDiscount) {
                throw new AppError(
                    'Transaksi amount 0 hanya diperbolehkan jika harga produk 0 atau diskon 100%',
                    400
                );
            }
        }

        // 1b. Validasi total payment >= total_amount
        const totalPayment = payment_method.reduce(
            (sum, pm) => sum + parseFloat(pm.amount), 0
        );
        if (totalPayment < parseFloat(total_amount)) {
            throw new AppError(
                `Total payment (${totalPayment}) is less than total amount (${total_amount})`,
                400
            );
        }

        // 2. Validasi stok untuk item bertipe 'product'
        const productItems = items.filter(item => item.item_type === 'product');

        for (const item of productItems) {
            // Lock row FOR UPDATE untuk menghindari race condition
            const product = await Product.findOne({
                where: { id: item.item_id, store_id },
                lock: t.LOCK.UPDATE,
                transaction: t
            });

            if (!product) {
                throw new AppError(
                    `Product not found: ${item.item_name}`,
                    400
                );
            }

            if (product.stock < item.quantity) {
                throw new AppError(
                    `Transaction failed: Insufficient stock for ${item.item_name} (available: ${product.stock}, requested: ${item.quantity})`,
                    400
                );
            }
        }

        // 2b. Validasi stok produk yang digunakan oleh layanan (via ProdukLayanan)
        const layananItems = items.filter(item => item.item_type === 'layanan');
        const layananStockReductions = []; // { product_id, product_name, totalQty }

        for (const item of layananItems) {
            const produkLayananList = await ProdukLayanan.findAll({
                where: { layanan_id: item.item_id },
                transaction: t
            });

            for (const pl of produkLayananList) {
                const requiredQty = pl.quantity * item.quantity;

                const product = await Product.findOne({
                    where: { id: pl.product_id, store_id },
                    lock: t.LOCK.UPDATE,
                    transaction: t
                });

                if (!product) {
                    throw new AppError(
                        `Product used by service "${item.item_name}" not found (product_id: ${pl.product_id})`,
                        400
                    );
                }

                if (product.stock < requiredQty) {
                    throw new AppError(
                        `Transaction failed: Insufficient stock for "${product.name}" used by service "${item.item_name}" (available: ${product.stock}, required: ${requiredQty})`,
                        400
                    );
                }

                layananStockReductions.push({
                    product_id: pl.product_id,
                    product_name: product.name,
                    totalQty: requiredQty
                });
            }
        }

        // 3. Generate receipt number
        const receiptNumber = await generateReceiptNumber(t);

        // 4. Insert transaksi
        const transaksi = await Transaksi.create({
            store_id,
            user_id: userId,
            customer_id: customer_id || null,
            receipt_number: receiptNumber,
            subtotal: subtotal || total_amount,
            discount_type: discount_type || null,
            discount: discount || 0,
            total_amount,
            payment_status: 'PAID'
        }, { transaction: t });

        // 5. Insert detail items (bulk)
        const detailRecords = items.map(item => ({
            transaksi_id: transaksi.id,
            item_type: item.item_type,
            item_id: item.item_id,
            item_name: item.item_name,
            kategori_name: item.kategori_name || null,
            price: item.price,
            quantity: item.quantity,
            subtotal: item.subtotal
        }));

        await TransaksiDetail.bulkCreate(detailRecords, { transaction: t });

        // 6. Insert payment methods (bulk) — split payment support
        const paymentRecords = payment_method.map(pm => ({
            transaksi_id: transaksi.id,
            payment_method: pm.method,
            nominal: pm.amount
        }));

        await TransaksiPayment.bulkCreate(paymentRecords, { transaction: t });

        // 7. Kurangi stok produk (direct product items)
        for (const item of productItems) {
            await Product.decrement('stock', {
                by: item.quantity,
                where: { id: item.item_id, store_id },
                transaction: t
            });
        }

        // 7b. Kurangi stok produk yang digunakan oleh layanan
        for (const reduction of layananStockReductions) {
            await Product.decrement('stock', {
                by: reduction.totalQty,
                where: { id: reduction.product_id, store_id },
                transaction: t
            });
        }

        // 8. Commit transaction
        await t.commit();

        logger.info({
            type: 'transaksi_created',
            transaksi_id: transaksi.id,
            receipt_number: receiptNumber,
            total_amount,
            user_id: userId,
            store_id
        });

        return {
            transaksi_id: transaksi.id,
            invoice_number: receiptNumber
        };
    } catch (error) {
        // Rollback transaction
        await t.rollback();

        logger.error({
            type: 'transaksi_create_failed',
            message: error.message,
            user_id: userId,
            store_id: data.store_id
        });

        // Re-throw AppError langsung, wrap error lain
        if (error instanceof AppError) {
            throw error;
        }

        throw new AppError('Failed to create transaction', 500);
    }
};
/**
 * Get Detail Transaksi
 * - Mengambil data transaksi lengkap beserta detail items, payments, customer, dan kasir
 */
const getTransaksiDetail = async (transaksiId) => {
    try {
        const transaksi = await Transaksi.findByPk(transaksiId, {
            attributes: ['id', 'receipt_number', 'subtotal', 'discount_type', 'discount', 'total_amount', 'payment_status', 'created_at'],
            include: [
                {
                    model: TransaksiDetail,
                    as: 'details',
                    attributes: ['id', 'item_type', 'item_id', 'item_name', 'kategori_name', 'price', 'quantity', 'subtotal']
                },
                {
                    model: TransaksiPayment,
                    as: 'payments',
                    attributes: [['payment_method', 'method'], ['nominal', 'amount']]
                },
                {
                    model: Customer,
                    as: 'customer',
                    attributes: ['id', 'name', 'phone', 'email']
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username']
                },
                {
                    model: Store,
                    as: 'store',
                    attributes: ['id', 'name']
                }
            ]
        });

        if (!transaksi) {
            throw new AppError('Transaksi not found', 404);
        }

        return transaksi;
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }

        logger.error({
            type: 'transaksi_detail_failed',
            message: error.message,
            transaksi_id: transaksiId
        });

        throw new AppError('Failed to get transaction detail', 500);
    }
};

/**
 * Laporan Penjualan (Histori)
 * - Mengambil daftar transaksi dengan filter tanggal dan store
 * - Menghitung summary (total_revenue, total_transactions)
 * - Pagination
 */
const getLaporanPenjualan = async ({ start_date, end_date, store_id, page = 1, limit = 20 }) => {
    try {
        const offset = (page - 1) * limit;

        // Build where clause
        const whereClause = {};

        if (store_id) {
            whereClause.store_id = store_id;
        }

        if (start_date && end_date) {
            whereClause.created_at = {
                [Op.between]: [
                    new Date(`${start_date}T00:00:00`),
                    new Date(`${end_date}T23:59:59`)
                ]
            };
        }

        // 1. Summary — total revenue & total transactions (dari seluruh data yang match filter)
        const summary = await Transaksi.findOne({
            where: whereClause,
            attributes: [
                [fn('COALESCE', fn('SUM', col('total_amount')), 0), 'total_revenue'],
                [fn('COUNT', col('id')), 'total_transactions']
            ],
            raw: true
        });

        // 2. Paginated items
        const { count: total, rows: transaksiList } = await Transaksi.findAndCountAll({
            where: whereClause,
            attributes: ['id', 'receipt_number', 'total_amount', 'created_at'],
            include: [
                {
                    model: Customer,
                    as: 'customer',
                    attributes: ['name']
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['username']
                },
                {
                    model: Store,
                    as: 'store',
                    attributes: ['name']
                },
                {
                    model: TransaksiDetail,
                    as: 'details',
                    attributes: ['item_type'],
                    limit: 1 // hanya ambil 1 untuk menentukan type
                }
            ],
            order: [['created_at', 'DESC']],
            limit,
            offset,
            distinct: true // agar count tidak kena duplikasi dari include
        });

        // 3. Format items sesuai API contract
        const items = transaksiList.map(trx => ({
            id: trx.id,
            invoice_number: trx.receipt_number,
            created_at: trx.created_at,
            customer_name: trx.customer ? trx.customer.name : null,
            total_amount: trx.total_amount,
            type: trx.details && trx.details.length > 0 ? trx.details[0].item_type : null,
            kasir: trx.user ? trx.user.username : null,
            store: trx.store ? trx.store.name : null
        }));

        const totalPages = Math.ceil(total / limit);

        return {
            summary: {
                total_revenue: parseFloat(summary.total_revenue) || 0,
                total_transactions: parseInt(summary.total_transactions, 10) || 0
            },
            items,
            meta: {
                page,
                limit,
                total,
                total_pages: totalPages
            }
        };
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }

        logger.error({
            type: 'laporan_penjualan_failed',
            message: error.message
        });

        throw new AppError('Failed to get sales report', 500);
    }
};

/**
 * Delete Transaksi
 * - Mengembalikan stok produk dan layanan
 * - Melakukan soft-delete pada transaksi
 */
const deleteTransaksi = async (transaksiId) => {
    const t = await sequelize.transaction();

    try {
        const transaksi = await Transaksi.findByPk(transaksiId, {
            transaction: t,
            lock: t.LOCK.UPDATE
        });

        if (!transaksi) {
            throw new AppError('Transaksi not found', 404);
        }

        const details = await TransaksiDetail.findAll({
            where: { transaksi_id: transaksiId },
            transaction: t,
            lock: t.LOCK.UPDATE // Lock details juga untuk konsistensi
        });

        const storeId = transaksi.store_id;

        // 1. Kembalikan stok
        for (const item of details) {
            if (item.item_type === 'product') {
                await Product.increment('stock', {
                    by: item.quantity,
                    where: { id: item.item_id, store_id: storeId },
                    transaction: t
                });
            } else if (item.item_type === 'layanan') {
                const produkLayananList = await ProdukLayanan.findAll({
                    where: { layanan_id: item.item_id },
                    transaction: t
                });

                for (const pl of produkLayananList) {
                    const requiredQty = pl.quantity * item.quantity;
                    await Product.increment('stock', {
                        by: requiredQty,
                        where: { id: pl.product_id, store_id: storeId },
                        transaction: t
                    });
                }
            }
        }

        // 2. Soft-delete transaksi
        await transaksi.destroy({ transaction: t });

        await t.commit();

        logger.info({
            type: 'transaksi_deleted',
            transaksi_id: transaksiId
        });

        return true;
    } catch (error) {
        await t.rollback();

        logger.error({
            type: 'transaksi_delete_failed',
            message: error.message,
            transaksi_id: transaksiId
        });

        if (error instanceof AppError) {
            throw error;
        }

        throw new AppError('Failed to delete transaction', 500);
    }
};

module.exports = { createTransaksi, getTransaksiDetail, getLaporanPenjualan, deleteTransaksi };
