const db = require('../models');
const AppError = require('../utils/app.error');
const logger = require('../utils/logger.util');
const { Layanan, KategoriLayanan, ProdukLayanan, Product, Store } = db;

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

        if (opts.status !== undefined && opts.status !== null && opts.status !== '') {
            const statusStr = String(opts.status).toLowerCase();
            if (statusStr === 'true' || statusStr === '1') {
                where.is_active = true;
            } else if (statusStr === 'false' || statusStr === '0') {
                where.is_active = false;
            }
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

/**
 * Create a new service category
 * @param {object} data {name, description}
 */
const createServiceCategory = async (data) => {
    try {
        const errors = [];
        if (!data.name) errors.push({ field: 'name', message: 'Name is required' });
        if (errors.length > 0) throw new AppError('Validation error', 400, errors);

        const category = await KategoriLayanan.create({
            name: data.name,
            description: data.description || null,
            is_active: true
        });

        return { id: category.id, name: category.name, description: category.description, is_active: category.is_active };
    } catch (error) {
        logger.error({ type: 'create_service_category_failed', message: error.message, stack: error.stack });
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to create service category: ' + error.message, 500);
    }
};

/**
 * Update an existing service category
 * @param {string} id
 * @param {object} data
 */
const updateServiceCategory = async (id, data) => {
    try {
        const category = await KategoriLayanan.findByPk(id);
        if (!category) {
            throw new AppError('Service category not found', 404);
        }

        const errors = [];
        if (data.name !== undefined && !data.name) errors.push({ field: 'name', message: 'Name cannot be empty' });
        if (errors.length > 0) throw new AppError('Validation error', 400, errors);

        await category.update({
            name: data.name !== undefined ? data.name : category.name,
            description: data.description !== undefined ? data.description : category.description,
            is_active: data.is_active !== undefined ? data.is_active : category.is_active
        });

        return { id: category.id, name: category.name, description: category.description, is_active: category.is_active };
    } catch (error) {
        logger.error({ type: 'update_service_category_failed', message: error.message, stack: error.stack });
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to update service category: ' + error.message, 500);
    }
};

/**
 * Delete a service category
 * @param {string} id
 */
const deleteServiceCategory = async (id) => {
    try {
        const category = await KategoriLayanan.findByPk(id);
        if (!category) {
            throw new AppError('Service category not found', 404);
        }

        // Check if there are services using this category
        const usedCount = await Layanan.count({ where: { kategori_layanan_id: id } });
        if (usedCount > 0) {
            throw new AppError('Kategori masih digunakan oleh layanan aktif', 400);
        }

        await category.destroy();

        return { message: 'Service category deleted successfully' };
    } catch (error) {
        logger.error({ type: 'delete_service_category_failed', message: error.message, stack: error.stack });
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to delete service category: ' + error.message, 500);
    }
};

/**
 * Helper: link products to a service by SKU array
 * @param {string} layananId
 * @param {Array} products - [{sku: 'xxx'}, ...]
 * @param {string} storeId
 * @param {object} transaction
 */
const linkProductsToService = async (layananId, products, storeId, transaction) => {
    const warnings = [];

    for (const p of products) {
        if (!p.sku) continue;

        const prod = await Product.findOne({ where: { sku: p.sku, store_id: storeId }, transaction });
        if (!prod) {
            warnings.push(`Product SKU '${p.sku}' not found`);
            continue;
        }

        // Check for existing link (including soft-deleted)
        const existingLink = await ProdukLayanan.findOne({
            where: { layanan_id: layananId, product_id: prod.id },
            paranoid: false,
            transaction
        });

        if (existingLink) {
            if (existingLink.deletedAt) {
                await existingLink.restore({ transaction });
            }
            // already linked, skip
        } else {
            await ProdukLayanan.create({ layanan_id: layananId, product_id: prod.id }, { transaction });
        }
    }

    return warnings;
};

/**
 * Create a new service
 * @param {object} data
 * @param {string} storeId
 */
const createService = async (data, storeId) => {
    const transaction = await db.sequelize.transaction();
    try {
        const errors = [];

        if (!data.name) errors.push({ field: 'name', message: 'Name is required' });
        if (!data.price && data.price !== 0) errors.push({ field: 'price', message: 'Price is required' });

        if (errors.length > 0) {
            throw new AppError('Validation error', 400, errors);
        }

        const service = await Layanan.create({
            store_id: storeId,
            kategori_layanan_id: data.kategori_layanan_id || null,
            name: data.name,
            price: data.price,
            cost_price: data.cost_price || 0,
            biaya_overhead: data.biaya_overhead || 0,
            description: data.description || null,
            is_active: data.is_active !== undefined ? data.is_active : true
        }, { transaction });

        // Link products by SKU
        if (data.products && data.products.length > 0) {
            const warnings = await linkProductsToService(service.id, data.products, storeId, transaction);
            if (warnings.length > 0) {
                logger.warn({ type: 'create_service_product_warnings', service_id: service.id, warnings });
            }
        }

        await transaction.commit();

        return { id: service.id, name: service.name };
    } catch (error) {
        await transaction.rollback();
        logger.error({ type: 'create_service_failed', message: error.message, stack: error.stack });
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to create service: ' + error.message, 500);
    }
};

/**
 * Update an existing service
 * @param {string} id
 * @param {object} data
 * @param {string} storeId
 */
const updateService = async (id, data, storeId) => {
    const transaction = await db.sequelize.transaction();
    try {
        const service = await Layanan.findOne({ where: { id, store_id: storeId }, transaction });

        if (!service) {
            throw new AppError('Service not found', 404);
        }

        const errors = [];
        if (!data.name) errors.push({ field: 'name', message: 'Name is required' });
        if (!data.price && data.price !== 0) errors.push({ field: 'price', message: 'Price is required' });

        if (errors.length > 0) {
            throw new AppError('Validation error', 400, errors);
        }

        await service.update({
            kategori_layanan_id: data.kategori_layanan_id || null,
            name: data.name,
            price: data.price,
            cost_price: data.cost_price || 0,
            biaya_overhead: data.biaya_overhead || 0,
            description: data.description || null,
            is_active: data.is_active !== undefined ? data.is_active : service.is_active
        }, { transaction });

        // Replace product links: remove existing then re-link from request
        if (data.products !== undefined) {
            await ProdukLayanan.destroy({ where: { layanan_id: id }, transaction });

            if (data.products && data.products.length > 0) {
                const warnings = await linkProductsToService(id, data.products, storeId, transaction);
                if (warnings.length > 0) {
                    logger.warn({ type: 'update_service_product_warnings', service_id: id, warnings });
                }
            }
        }

        await transaction.commit();

        return { id: service.id, name: service.name };
    } catch (error) {
        await transaction.rollback();
        logger.error({ type: 'update_service_failed', message: error.message, stack: error.stack });
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to update service: ' + error.message, 500);
    }
};

/**
 * Soft delete a service
 * @param {string} id
 * @param {string} storeId
 */
const deleteService = async (id, storeId) => {
    try {
        const service = await Layanan.findOne({ where: { id, store_id: storeId } });

        if (!service) {
            throw new AppError('Service not found', 404);
        }

        await service.destroy(); // paranoid soft delete

        return { message: 'Service deleted successfully' };
    } catch (error) {
        logger.error({ type: 'delete_service_failed', message: error.message, stack: error.stack });
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to delete service: ' + error.message, 500);
    }
};

/**
 * Update service active status
 * @param {string} id
 * @param {boolean} isActive
 * @param {string} storeId
 */
const updateServiceStatus = async (id, isActive, storeId) => {
    try {
        const service = await Layanan.findOne({ where: { id, store_id: storeId } });

        if (!service) {
            throw new AppError('Service not found', 404);
        }

        await service.update({ is_active: isActive });

        return { message: `Service ${isActive ? 'activated' : 'deactivated'} successfully` };
    } catch (error) {
        logger.error({ type: 'update_service_status_failed', message: error.message, stack: error.stack });
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to update service status: ' + error.message, 500);
    }
};

/**
 * Get service detail by ID
 * @param {string} id
 * @param {string} storeId
 */
const getServiceById = async (id, storeId) => {
    try {
        const service = await Layanan.findOne({
            where: { id, store_id: storeId },
            include: [
                { model: Store, as: 'store', attributes: ['name'] },
                { model: KategoriLayanan, as: 'kategori', attributes: ['id', 'name'] },
                {
                    model: ProdukLayanan,
                    as: 'produkLayanan',
                    include: [
                        { model: Product, as: 'product', attributes: ['id', 'sku', 'name'] }
                    ]
                }
            ]
        });

        if (!service) {
            throw new AppError('Service not found', 404);
        }

        return {
            id: service.id,
            name: service.name,
            price: Number(service.price),
            cost_price: Number(service.cost_price),
            biaya_overhead: service.biaya_overhead || 0,
            description: service.description || null,
            store_id: service.store_id,
            store_name: service.store?.name || '',
            kategori_layanan_id: service.kategori_layanan_id,
            kategori_name: service.kategori?.name || '',
            is_active: service.is_active,
            created_at: service.created_at,
            updated_at: service.updated_at,
            deleted_at: service.deleted_at,
            produkLayanan: (service.produkLayanan || []).map(pl => {
                const prod = pl.product || pl;
                return {
                    id: prod.id || pl.product_id,
                    sku: prod.sku || '',
                    name: prod.name || ''
                };
            })
        };
    } catch (error) {
        logger.error({ type: 'get_service_detail_failed', message: error.message, stack: error.stack });
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to fetch service detail: ' + error.message, 500);
    }
};

module.exports = {
    getAllServices,
    getServiceCategoriesList,
    createServiceCategory,
    updateServiceCategory,
    deleteServiceCategory,
    createService,
    updateService,
    deleteService,
    updateServiceStatus,
    getServiceById
};
