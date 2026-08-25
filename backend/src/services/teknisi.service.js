const db = require('../models');
const { Transaksi, TransaksiDetail, TeknisiUpload, Customer, User, Staff, sequelize } = db;
const { Op, literal } = require('sequelize');
const { uploadImageAsWebp, deleteImage: deleteImageFromR2 } = require('../utils/r2.util');
const AppError = require('../utils/app.error');

/**
 * Get list of transactions that have at least one service item (item_type = 'layanan')
 * Includes upload status count per transaction
 */
const getTeknisiTransactions = async ({ page = 1, limit = 20, search, store_id, start_date, end_date, staff_id }) => {
    const offset = (page - 1) * limit;

    // Build where clause for transactions
    const transaksiWhere = {};
    if (store_id) {
        transaksiWhere.store_id = store_id;
    }
    // Date range filter on transaction_date
    if (start_date && end_date) {
        transaksiWhere.transaction_date = {
            [Op.between]: [
                new Date(`${start_date}T00:00:00.000Z`),
                new Date(`${end_date}T23:59:59.999Z`),
            ],
        };
    } else if (start_date) {
        transaksiWhere.transaction_date = { [Op.gte]: new Date(`${start_date}T00:00:00.000Z`) };
    } else if (end_date) {
        transaksiWhere.transaction_date = { [Op.lte]: new Date(`${end_date}T23:59:59.999Z`) };
    }

    // Subquery: get transaksi_ids that have at least one layanan detail assigned to this staff
    const detailWhere = { item_type: 'layanan' };
    if (staff_id) detailWhere.staff_id = staff_id;

    const transaksiIdsWithLayanan = await TransaksiDetail.findAll({
        attributes: [[sequelize.fn('DISTINCT', sequelize.col('transaksi_id')), 'transaksi_id']],
        where: detailWhere,
        raw: true,
    });

    const ids = transaksiIdsWithLayanan.map(r => r.transaksi_id);

    if (ids.length === 0) {
        return {
            items: [],
            total_items: 0,
            total_pages: 0,
            current_page: page,
            limit,
        };
    }

    transaksiWhere.id = { [Op.in]: ids };

    // If search, filter by receipt_number or customer name
    if (search && search.trim()) {
        const searchLike = `%${search.trim()}%`;
        // We'll use a raw where for customer name search
        transaksiWhere[Op.or] = [
            { receipt_number: { [Op.iLike]: searchLike } },
            literal(`"customer"."name" ILIKE '${search.trim().replace(/'/g, "''")}'`),
        ];
    }

    // Calculate total items matching criteria
    const count = await Transaksi.count({
        where: transaksiWhere,
        include: [
            {
                model: Customer,
                as: 'customer',
                attributes: [],
            },
        ],
    });

    if (count === 0) {
        return {
            items: [],
            total_items: 0,
            total_pages: 0,
            current_page: page,
            limit,
        };
    }

    // Get paginated transaction IDs
    const paginatedTrans = await Transaksi.findAll({
        attributes: ['id', 'transaction_date', 'created_at'],
        where: transaksiWhere,
        include: [
            {
                model: Customer,
                as: 'customer',
                attributes: [],
            },
        ],
        order: [['transaction_date', 'DESC'], ['created_at', 'DESC']],
        limit,
        offset,
    });

    const finalIds = paginatedTrans.map(t => t.id);

    // Fetch full data for those IDs
    const rows = await Transaksi.findAll({
        where: { id: { [Op.in]: finalIds } },
        include: [
            {
                model: Customer,
                as: 'customer',
                attributes: ['id', 'name'],
            },
            {
                model: TransaksiDetail,
                as: 'details',
                where: detailWhere,
                attributes: ['id'],
                include: [
                    {
                        model: TeknisiUpload,
                        as: 'uploads',
                        attributes: ['id', 'image_url'],
                    },
                ],
            },
        ],
        attributes: ['id', 'receipt_number', 'transaction_date', 'created_at'],
        order: [['transaction_date', 'DESC'], ['created_at', 'DESC']],
    });

    // Calculate upload status per transaction
    const items = rows.map(t => {
        const totalLayanan = t.details.length;
        const uploadedCount = t.details.filter(d => d.uploads && d.uploads.length > 0).length;

        // Collect all uploads for the transaction
        const uploads = t.details.reduce((acc, d) => {
            if (d.uploads) {
                acc.push(...d.uploads.map(u => ({ id: u.id, image_url: u.image_url })));
            }
            return acc;
        }, []);

        let upload_status = 'none'; // merah
        if (uploadedCount > 0 && uploadedCount < totalLayanan) {
            upload_status = 'partial'; // kuning
        } else if (uploadedCount >= totalLayanan && totalLayanan > 0) {
            upload_status = 'complete'; // hijau
        }

        return {
            id: t.id,
            receipt_number: t.receipt_number,
            transaction_date: t.transaction_date || t.created_at,
            customer_name: t.customer?.name || 'Walk-in',
            total_layanan: totalLayanan,
            uploaded_count: uploadedCount,
            upload_status,
            uploads,
        };
    });

    return {
        items,
        total_items: count,
        total_pages: Math.ceil(count / limit),
        current_page: page,
        limit,
    };
};

/**
 * Get transaction detail — only layanan items with their uploads
 */
const getTeknisiTransactionDetail = async (transaksiId, staff_id) => {
    const transaksi = await Transaksi.findByPk(transaksiId, {
        include: [
            {
                model: Customer,
                as: 'customer',
                attributes: ['id', 'name'],
            },
        ],
        attributes: ['id', 'receipt_number', 'transaction_date', 'created_at'],
    });

    if (!transaksi) {
        throw new AppError('Transaksi tidak ditemukan', 404);
    }

    // Use raw SQL to get layanan details with insentif in one query
    const { QueryTypes } = require('sequelize');
    const layananRows = await sequelize.query(`
        SELECT
            td.id,
            td.item_name,
            td.kategori_name,
            td.price,
            td.quantity,
            td.subtotal,
            td.staff_id,
            td.snapshot_insentif_teknisi,
            COALESCE(td.snapshot_insentif_teknisi, l.insentif_teknisi, 0) AS insentif_per_item,
            s.name AS staff_name
        FROM transaksi_detail td
        LEFT JOIN staff s ON s.id = td.staff_id
        LEFT JOIN layanan l ON td.item_type = 'layanan' AND td.item_id = l.id
        WHERE td.transaksi_id = :transaksiId
          AND td.item_type = 'layanan'
          AND td.deleted_at IS NULL
          ${staff_id ? 'AND td.staff_id = :staff_id' : ''}
        ORDER BY td.created_at ASC
    `, {
        replacements: { transaksiId, staff_id: staff_id || null },
        type: QueryTypes.SELECT,
    });

    // Get uploads for each detail
    const detailIds = layananRows.map(r => r.id);
    let uploadsMap = {};
    if (detailIds.length > 0) {
        const uploadRows = await TeknisiUpload.findAll({
            where: { transaksi_detail_id: detailIds },
            include: [
                { model: User, as: 'uploader', attributes: ['id', 'username'] },
            ],
            order: [['created_at', 'ASC']],
        });
        for (const u of uploadRows) {
            if (!uploadsMap[u.transaksi_detail_id]) uploadsMap[u.transaksi_detail_id] = [];
            uploadsMap[u.transaksi_detail_id].push({
                id: u.id,
                image_url: u.image_url,
                uploaded_by_name: u.uploader?.username || '-',
                created_at: u.created_at,
            });
        }
    }

    return {
        id: transaksi.id,
        receipt_number: transaksi.receipt_number,
        transaction_date: transaksi.transaction_date || transaksi.created_at,
        customer_name: transaksi.customer?.name || 'Walk-in',
        details: layananRows.map(d => ({
            id: d.id,
            item_name: d.item_name,
            kategori_name: d.kategori_name,
            price: d.price,
            quantity: d.quantity,
            subtotal: d.subtotal,
            staff_name: d.staff_name || null,
            insentif_per_item: parseFloat(d.insentif_per_item) || 0,
            uploads: uploadsMap[d.id] || [],
        })),
    };
};

/**
 * Get total insentif sum for a given date range and store (for the summary card)
 */
const getTeknisiInsentifTotal = async ({ start_date, end_date, store_id, staff_id }) => {
    const transaksiWhere = {};
    if (store_id) transaksiWhere.store_id = store_id;
    if (start_date && end_date) {
        transaksiWhere.transaction_date = {
            [Op.between]: [
                new Date(`${start_date}T00:00:00.000Z`),
                new Date(`${end_date}T23:59:59.999Z`),
            ],
        };
    }

    const result = await sequelize.query(`
        SELECT
            COALESCE(SUM(
                COALESCE(td.snapshot_insentif_teknisi, l.insentif_teknisi, 0) * td.quantity
            ), 0) AS total_insentif
        FROM transaksi_detail td
        JOIN transaksi t ON t.id = td.transaksi_id
        LEFT JOIN layanan l ON td.item_type = 'layanan' AND td.item_id = l.id
        WHERE td.item_type = 'layanan'
            ${store_id ? `AND t.store_id = :store_id` : ''}
            ${start_date && end_date ? `AND t.transaction_date BETWEEN :start_date AND :end_date` : ''}
            ${staff_id ? `AND td.staff_id = :staff_id` : ''}
            AND t.deleted_at IS NULL
            AND td.deleted_at IS NULL
    `, {
        replacements: {
            store_id: store_id || null,
            start_date: start_date ? `${start_date}T00:00:00.000Z` : null,
            end_date: end_date ? `${end_date}T23:59:59.999Z` : null,
            staff_id: staff_id || null,
        },
        type: sequelize.QueryTypes.SELECT,
    });

    return parseFloat(result[0]?.total_insentif) || 0;
};

/**
 * Upload an image for a specific transaksi detail (layanan item)
 */
const uploadTeknisiImage = async (transaksiDetailId, fileBuffer, userId) => {
    // Verify the detail exists and is a layanan
    const detail = await TransaksiDetail.findByPk(transaksiDetailId);
    if (!detail) {
        throw new AppError('Item transaksi tidak ditemukan', 404);
    }
    if (detail.item_type !== 'layanan') {
        throw new AppError('Hanya item layanan yang bisa di-upload bukti pengerjaan', 400);
    }

    // Upload to R2
    const result = await uploadImageAsWebp(fileBuffer, 'teknisi-uploads');

    // Save record
    const upload = await TeknisiUpload.create({
        transaksi_detail_id: transaksiDetailId,
        image_url: result.url,
        image_key: result.key,
        uploaded_by: userId,
    });

    // Fetch with uploader info
    const saved = await TeknisiUpload.findByPk(upload.id, {
        include: [
            {
                model: User,
                as: 'uploader',
                attributes: ['id', 'username'],
            },
        ],
    });

    return {
        id: saved.id,
        image_url: saved.image_url,
        uploaded_by_name: saved.uploader?.username || '-',
        created_at: saved.created_at,
    };
};

/**
 * Delete a teknisi upload image
 */
const deleteTeknisiImage = async (uploadId) => {
    const upload = await TeknisiUpload.findByPk(uploadId);
    if (!upload) {
        throw new AppError('Upload tidak ditemukan', 404);
    }

    // Delete from R2
    await deleteImageFromR2(upload.image_key);

    // Soft delete record
    await upload.destroy();

    return { message: 'Bukti pengerjaan berhasil dihapus' };
};

module.exports = {
    getTeknisiTransactions,
    getTeknisiTransactionDetail,
    getTeknisiInsentifTotal,
    uploadTeknisiImage,
    deleteTeknisiImage,
};
