const db = require('../models');
const { KlaimGaransi, KlaimGaransiBukti, TransaksiDetail, Transaksi, ProdukLayanan, Product, Supplier, User, sequelize } = db;
const AppError = require('../utils/app.error');
const { JENIS_MUTASI_STOK } = require('../utils/enums');
const { insertMutasiStok } = require('../utils/mutasiStok.helper');

const getKlaimByTransaksiDetailId = async (transaksiDetailId) => {
    try {
        const klaim = await KlaimGaransi.findOne({
            where: { transaksi_detail_id: transaksiDetailId },
            include: [
                {
                    model: KlaimGaransiBukti,
                    as: 'bukti'
                },
                {
                    model: Supplier,
                    as: 'supplier',
                    attributes: ['id', 'name']
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username']
                },
                {
                    model: db.TipeHp,
                    as: 'tipe_hp',
                    attributes: ['id', 'name']
                }
            ]
        });

        return klaim;
    } catch (error) {
        console.error('Error getKlaimByTransaksiDetailId:', error);
        throw new AppError('Gagal memuat detail klaim', 500);
    }
};

const createKlaimGaransi = async (transaksiDetailId, data, userId) => {
    const transaction = await sequelize.transaction();
    try {
        // 1. Validasi Transaksi Detail
        const detail = await TransaksiDetail.findByPk(transaksiDetailId, {
            include: [{ model: Transaksi, as: 'transaksi' }],
            transaction
        });

        if (!detail) {
            throw new AppError('Item transaksi tidak ditemukan', 404);
        }

        if (detail.item_type !== 'layanan') {
            throw new AppError('Klaim garansi hanya berlaku untuk item layanan', 400);
        }

        if (detail.transaksi.payment_status?.toUpperCase() !== 'PAID') {
            throw new AppError('Klaim garansi hanya bisa dilakukan pada transaksi yang sudah lunas', 400);
        }

        // 2. Cek apakah sudah pernah klaim
        const existingKlaim = await KlaimGaransi.findOne({
            where: { transaksi_detail_id: transaksiDetailId },
            transaction
        });

        if (existingKlaim) {
            throw new AppError('Item ini sudah pernah diklaim garansinya', 400);
        }

        // 3. Simpan Klaim Garansi
        const now = new Date();
        let klaimDate = now;

        if (data.tanggal_klaim) {
            // data.tanggal_klaim expects 'YYYY-MM-DD'
            const [year, month, day] = data.tanggal_klaim.split('-');
            if (year && month && day) {
                // Keep the current time but change the date
                klaimDate.setFullYear(parseInt(year, 10));
                klaimDate.setMonth(parseInt(month, 10) - 1);
                klaimDate.setDate(parseInt(day, 10));
            }
        }

        const klaim = await KlaimGaransi.create({
            transaksi_detail_id: transaksiDetailId,
            tanggal_klaim: klaimDate,
            user_id: userId,
            tindakan: data.tindakan,
            kendala: data.kendala,
            supplier_id: data.supplier_id || null,
            merk: data.merk || null,
            tipe_hp_id: data.tipe_hp_id || null,
            detail_tindakan: data.detail_tindakan || null,
        }, { transaction });

        // 4. Simpan Bukti (jika ada)
        if (data.uploads && data.uploads.length > 0) {
            const buktiData = data.uploads.map(u => ({
                klaim_garansi_id: klaim.id,
                image_url: u.url,
                image_key: u.key
            }));
            await KlaimGaransiBukti.bulkCreate(buktiData, { transaction });
        }

        // 5. Jika Ganti Sparepart -> Mutasi Stok Keluar
        if (data.tindakan === 'ganti_sparepart') {
            const qtyLayanan = detail.quantity; // berapa kali layanan ini dibeli
            const layananId = detail.item_id;

            // Cari produk-produk yang terhubung dengan layanan ini
            const produkLayananList = await ProdukLayanan.findAll({
                where: { layanan_id: layananId },
                include: [{ model: Product, as: 'product' }],
                transaction
            });

            if (produkLayananList.length > 0) {
                const mutasiData = [];
                for (const pl of produkLayananList) {
                    const totalQtyUsed = pl.quantity * qtyLayanan; // qty produk per layanan * jumlah layanan dibeli

                    if (pl.product) {
                        mutasiData.push({
                            product_id: pl.product_id,
                            jenis_mutasi: JENIS_MUTASI_STOK.KLAIM_GARANSI,
                            stok: -totalQtyUsed, // Pengurangan stok
                            reference_id: klaim.id,
                            keterangan: `Klaim garansi untuk transaksi ${detail.transaksi.receipt_number} - Item: ${detail.item_name}`
                        });

                        // Update stok produk
                        await pl.product.decrement('stock', {
                            by: totalQtyUsed,
                            transaction
                        });
                    }
                }

                if (mutasiData.length > 0) {
                    await insertMutasiStok(mutasiData, { transaction });
                }
            }
        }

        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        if (error instanceof AppError) throw error;
        console.error('Error createKlaimGaransi:', error);
        throw new AppError('Gagal menyimpan klaim garansi', 500);
    }

    // Return full detail — OUTSIDE transaction try-catch to avoid rollback on committed tx
    return await getKlaimByTransaksiDetailId(transaksiDetailId);
};

const getLaporanKlaimGaransi = async ({ start_date, end_date, page = 1, limit = 20, store_id }) => {
    try {
        const { Op } = require('sequelize');
        const offset = (page - 1) * limit;

        const where = {};
        if (start_date && end_date) {
            where.tanggal_klaim = {
                [Op.between]: [
                    new Date(start_date + 'T00:00:00.000Z'),
                    new Date(end_date + 'T23:59:59.999Z')
                ]
            };
        }

        // Build transaksi include with optional store filter
        const transaksiInclude = {
            model: db.Transaksi,
            as: 'transaksi',
            required: store_id ? true : false,
            attributes: ['id', 'receipt_number', 'created_at', 'store_id'],
            where: store_id ? { store_id } : undefined,
            include: [
                {
                    model: db.Customer,
                    as: 'customer',
                    attributes: ['id', 'name'],
                    required: false
                },
                {
                    model: db.Store,
                    as: 'store',
                    attributes: ['id', 'name'],
                    required: false
                }
            ]
        };

        const transaksiDetailInclude = {
            model: TransaksiDetail,
            as: 'transaksiDetail',
            required: store_id ? true : false,
            attributes: ['id', 'item_name', 'item_type', 'transaksi_id', 'staff_id'],
            include: [
                transaksiInclude,
                {
                    model: db.Staff,
                    as: 'staff',
                    attributes: ['id', 'name'],
                    required: false
                }
            ]
        };

        // Separate count query with minimal includes to avoid subquery column resolution issues
        const total = await KlaimGaransi.count({
            where,
            include: [
                {
                    model: TransaksiDetail,
                    as: 'transaksiDetail',
                    required: store_id ? true : false,
                    attributes: [],
                    include: store_id
                        ? [{
                            model: db.Transaksi,
                            as: 'transaksi',
                            required: true,
                            attributes: [],
                            where: { store_id }
                        }]
                        : []
                }
            ]
        });

        // Full data query using findAll with subQuery: false
        const rows = await KlaimGaransi.findAll({
            where,
            include: [
                transaksiDetailInclude,
                {
                    model: Supplier,
                    as: 'supplier',
                    attributes: ['id', 'name'],
                    required: false
                },
                {
                    model: db.TipeHp,
                    as: 'tipe_hp',
                    attributes: ['id', 'name'],
                    required: false
                },
                {
                    model: KlaimGaransiBukti,
                    as: 'bukti',
                    attributes: ['id', 'image_url'],
                    required: false
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username'],
                    required: false
                }
            ],
            order: [['tanggal_klaim', 'DESC']],
            limit,
            offset,
            subQuery: false
        });

        return {
            items: rows,
            meta: {
                total,
                page,
                limit,
                total_pages: Math.ceil(total / limit)
            }
        };
    } catch (error) {
        console.error('Error getLaporanKlaimGaransi:', error);
        throw new AppError('Gagal memuat laporan klaim garansi', 500);
    }
};

module.exports = {
    getKlaimByTransaksiDetailId,
    createKlaimGaransi,
    getLaporanKlaimGaransi
};
