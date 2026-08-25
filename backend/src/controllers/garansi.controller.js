const garansiService = require('../services/garansi.service');
const { uploadImageAsWebp } = require('../utils/r2.util');

const getLaporanKlaim = async (req, res, next) => {
    try {
        const { start_date, end_date, page = 1, limit = 20, store_id } = req.query;
        const result = await garansiService.getLaporanKlaimGaransi({
            start_date,
            end_date,
            page: parseInt(page),
            limit: parseInt(limit),
            store_id
        });
        return res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

const getKlaimDetail = async (req, res, next) => {
    try {
        const { transaksiDetailId } = req.params;
        const result = await garansiService.getKlaimByTransaksiDetailId(transaksiDetailId);
        return res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

const createKlaim = async (req, res, next) => {
    try {
        const { transaksiDetailId } = req.params;
        
        // Handle image uploads if any
        const uploads = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const uploadResult = await uploadImageAsWebp(file.buffer, 'klaim-garansi');
                uploads.push(uploadResult);
            }
        }

        const payload = {
            tindakan: req.body.tindakan,
            kendala: req.body.kendala,
            supplier_id: req.body.supplier_id,
            tipe_hp_id: req.body.tipe_hp_id,
            merk: req.body.merk,
            detail_tindakan: req.body.detail_tindakan,
            tanggal_klaim: req.body.tanggal_klaim,
            uploads
        };

        const result = await garansiService.createKlaimGaransi(transaksiDetailId, payload, req.user.user_id);
        
        return res.status(201).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

module.exports = { getLaporanKlaim, getKlaimDetail, createKlaim };
