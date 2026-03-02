const db = require('../models');
const AppError = require('../utils/app.error');
const logger = require('../utils/logger.util');
const { Layanan, KategoriLayanan, ProdukLayanan } = db;

/**
 * Get all services with pagination, search, filter and sorting
 * @param {object} opts {page, limit, search, sort, kategori_layanan_id}
 * @param {string} storeId
 */
const getAllServices = async (opts, storeId) => {
    try {
        const page = opts.page || 1;
        const limit = opts.limit || 10;
        const offset = (page - 1) * limit;
        const where = { store_id: storeId };

        // Filter by kategori_layanan_id (opsional)
        if (opts.kategori_layanan_id) {
            where.kategori_layanan_id = opts.kategori_layanan_id;
        }

        // Search on name or description
        if (opts.search) {
            const Sequelize = db.Sequelize;
            where[Sequelize.Op.or] = [
                { name: { [Sequelize.Op.iLike]: `%${opts.search}%` } },
                { description: { [Sequelize.Op.iLike]: `%${opts.search}%` } }
            ];
        }

        // Default order
        let order = [['created_at', 'DESC']];

        if (opts.sort) {
            const sortArr = Array.isArray(opts.sort) ? opts.sort : String(opts.sort).split(',');
            const sortableMap = {
                name: ['name'],
                price: ['price'],
                created_at: ['created_at'],
                is_active: ['is_active'],
                kategori_name: [{ model: KategoriLayanan, as: 'kategori' }, 'name']
            };

            order = [];
            for (const s of sortArr) {
                if (!s) continue;
                const parts = s.split(':');
                const field = parts[0];
                const dir = (parts[1] || 'asc').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

                const mapped = sortableMap[field];
                if (mapped) {
                    order.push([...mapped, dir]);
                }
            }

            if (order.length === 0) order = [['created_at', 'DESC']];
        }

        const { count, rows } = await Layanan.findAndCountAll({
            where,
            include: [
                { model: KategoriLayanan, as: 'kategori', attributes: ['name'] },
                { model: ProdukLayanan, as: 'produkLayanan', attributes: ['id'] }
            ],
            order,
            limit,
            offset,
            distinct: true // untuk count yang akurat saat include hasMany
        });

        const total = count;
        const total_pages = Math.ceil(total / limit);

        const items = rows.map(s => ({
            id: s.id,
            kategori_name: s.kategori?.name || '',
            name: s.name,
            price: Number(s.price),
            cost_price: Number(s.cost_price),
            description: s.description || '',
            count_product: s.produkLayanan ? s.produkLayanan.length : 0,
            is_active: s.is_active
        }));

        return {
            items,
            pagination: {
                page,
                limit,
                total,
                total_pages,
                has_next: page < total_pages,
                has_prev: page > 1
            }
        };
    } catch (error) {
        logger.error({ type: 'get_all_services_failed', message: error.message, stack: error.stack });
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to fetch services: ' + error.message, 500);
    }
};

/**
 * Get all service categories as a simple list (no pagination)
 * @param {object} opts {search, sort}
 */
const getServiceCategoriesList = async (opts = {}) => {
    try {
        const where = {};
        if (opts.search) {
            const Sequelize = db.Sequelize;
            where.name = { [Sequelize.Op.iLike]: `%${opts.search}%` };
        }

        let order = [['name', 'ASC']];
        if (opts.sort) {
            const sortArr = Array.isArray(opts.sort) ? opts.sort : String(opts.sort).split(',');
            order = [];
            for (const s of sortArr) {
                if (!s) continue;
                const parts = s.split(':');
                const field = parts[0];
                const dir = (parts[1] || 'asc').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
                order.push([field, dir]);
            }
            if (order.length === 0) order = [['name', 'ASC']];
        }

        const rows = await KategoriLayanan.findAll({ where, order });
        const items = rows.map(c => ({ id: c.id, name: c.name, description: c.description, is_active: c.is_active }));

        return items;
    } catch (error) {
        logger.error({ type: 'get_service_categories_failed', message: error.message, stack: error.stack });
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to fetch service categories: ' + error.message, 500);
    }
};

module.exports = {
    getAllServices,
    getServiceCategoriesList
};
