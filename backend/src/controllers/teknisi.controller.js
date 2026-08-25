const teknisiService = require('../services/teknisi.service');
const db = require('../models');

/**
 * GET /api/teknisi/transactions
 */
const getTransactions = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const { search, store_id, start_date, end_date } = req.query;

        const staff = await db.Staff.findOne({ where: { user_id: req.user.user_id } });
        const staff_id = staff ? staff.id : null;

        const result = await teknisiService.getTeknisiTransactions({
            page,
            limit,
            search,
            store_id: store_id || req.user.store_id,
            start_date,
            end_date,
            staff_id,
        });

        return res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/teknisi/insentif-total
 */
const getInsentifTotal = async (req, res, next) => {
    try {
        const { start_date, end_date, store_id } = req.query;
        const staff = await db.Staff.findOne({ where: { user_id: req.user.user_id } });
        const staff_id = staff ? staff.id : null;

        const total = await teknisiService.getTeknisiInsentifTotal({
            start_date,
            end_date,
            store_id: store_id || req.user.store_id,
            staff_id,
        });
        return res.json({ success: true, data: { total_insentif: total } });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/teknisi/transactions/:id
 */
const getTransactionDetail = async (req, res, next) => {
    try {
        const staff = await db.Staff.findOne({ where: { user_id: req.user.user_id } });
        const staff_id = staff ? staff.id : null;

        const result = await teknisiService.getTeknisiTransactionDetail(req.params.id, staff_id);

        return res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/teknisi/upload/:transaksiDetailId
 */
const uploadImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image file provided' });
        }

        const result = await teknisiService.uploadTeknisiImage(
            req.params.transaksiDetailId,
            req.file.buffer,
            req.user.user_id
        );

        return res.status(201).json({
            success: true,
            message: 'Bukti pengerjaan berhasil di-upload',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/teknisi/upload/:uploadId
 */
const deleteImage = async (req, res, next) => {
    try {
        const result = await teknisiService.deleteTeknisiImage(req.params.uploadId);

        return res.json({
            success: true,
            message: result.message,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getTransactions,
    getTransactionDetail,
    getInsentifTotal,
    uploadImage,
    deleteImage,
};
