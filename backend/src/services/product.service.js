const ExcelJS = require('exceljs');
const db = require('../models');
const AppError = require('../utils/app.error');
const logger = require('../utils/logger.util');
const { Product, KategoriProduk, Store, Layanan, KategoriLayanan, ProdukLayanan } = db;

/**
 * Get all products with pagination, search and sorting
 * @param {object} opts {page, limit, search, sort}
 * @param {string} storeId
 */
const getAllProducts = async (opts, storeId) => {
    const page = opts.page || 1;
    const limit = opts.limit || 10;
    const offset = (page - 1) * limit;
    const where = { store_id: storeId };

    if (opts.search) {
        // search on name or sku
        const Sequelize = db.Sequelize;
        where[Sequelize.Op.or] = [
            { name: { [Sequelize.Op.iLike]: `%${opts.search}%` } },
            { sku: { [Sequelize.Op.iLike]: `%${opts.search}%` } }
        ];
    }

    // base order
    let order = [['created_at', 'DESC']];

    if (opts.sort) {
        // sort can be comma separated or array
        const sortArr = Array.isArray(opts.sort) ? opts.sort : String(opts.sort).split(',');
        const sortableMap = {
            name: ['name'],
            price: ['price'],
            stock: ['stock'],
            created_at: ['created_at'],
            is_active: ['is_active'],
            kategori_name: [{ model: KategoriProduk, as: 'kategori' }, 'name'],
            sku: ['sku']
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

    const { count, rows } = await Product.findAndCountAll({
        where,
        include: [{ model: KategoriProduk, as: 'kategori', attributes: ['name'] }],
        order,
        limit,
        offset
    });

    const total_product = count;
    const total_pages = Math.ceil(total_product / limit);

    const items = rows.map(p => ({
        id: p.id,
        kategori_name: p.kategori?.name || '',
        name: p.name,
        sku: p.sku,
        image_url: p.image_url || null,
        price: Number(p.price),
        stok: p.stock,
        is_active: p.is_active
    }));

    return {
        items,
        pagination: {
            page,
            limit,
            total: total_product,
            total_pages,
            has_next: page < total_pages,
            has_prev: page > 1
        }
    };
};

/**
 * Get all product categories as a simple list (no pagination)
 * @param {object} opts {search, sort}
 */
const getProductCategoriesList = async (opts = {}) => {
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

    const rows = await KategoriProduk.findAll({ where, order });
    const items = rows.map(c => ({ id: c.id, name: c.name, description: c.description, is_active: c.is_active }));

    return items;
};

/**
 * Import products and services from Excel buffer
 * Only processes sheets: Product and Service. Uses transaction for all mutations.
 * @param {Buffer} buffer
 * @param {string} storeId
 * @param {object} user
 */
const importProducts = async (buffer, storeId, user) => {
    const transaction = await db.sequelize.transaction();
    try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);

        // Helper: map kategori name -> id
        const kategoriProdukList = await KategoriProduk.findAll({ attributes: ['id', 'name'] });
        const kategoriProdukMap = {};
        kategoriProdukList.forEach(k => { kategoriProdukMap[k.name] = k.id; });

        // --- Process Product sheet ---
        const productSheet = workbook.getWorksheet('Product');
        const incomingProducts = [];
        if (productSheet) {
            productSheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
                if (rowNumber === 1) return; // skip header
                const id = row.getCell('A').value ? String(row.getCell('A').value).trim() : null;
                const kategori_name = row.getCell('B').value ? String(row.getCell('B').value).trim() : null;
                const name = row.getCell('C').value ? String(row.getCell('C').value).trim() : null;
                const sku = row.getCell('D').value ? String(row.getCell('D').value).trim() : null;
                const stock = row.getCell('E').value || 0;
                const price = row.getCell('F').value || 0;
                const cost_price = row.getCell('G').value || 0;
                const jasa_pasang = row.getCell('H').value || 0;
                const ongkir_asuransi = row.getCell('I').value || 0;
                const biaya_overhead = row.getCell('J').value || 0;
                const is_active = String(row.getCell('K').value || '').toUpperCase() === 'YES';

                incomingProducts.push({ id, kategori_name, name, sku, stock, price, cost_price, jasa_pasang, ongkir_asuransi, biaya_overhead, is_active, row: rowNumber });
            });
        }

        // Build map for existing products in store
        const existingProducts = await Product.findAll({ where: { store_id: storeId }, paranoid: false, transaction });
        const existingById = {};
        const existingBySku = {};
        existingProducts.forEach(p => { existingById[p.id] = p; existingBySku[`${p.sku}::${p.store_id}`] = p; });

        const toInsert = [];
        const toUpdate = [];
        const seenIds = new Set();
        const seenSkus = new Set();
        const errors = [];

        for (const ip of incomingProducts) {
            const kategori_id = ip.kategori_name ? kategoriProdukMap[ip.kategori_name] : null;

            // Validate SKU unique by store
            const skuKey = `${ip.sku}::${storeId}`;
            if (!ip.sku) {
                errors.push({ field: `row_${ip.row}`, message: 'SKU is required' });
                continue;
            }

            if (seenSkus.has(skuKey)) {
                // duplicate in file, skip
                errors.push({ field: `row_${ip.row}`, message: 'Duplicate SKU in file' });
                continue;
            }

            seenSkus.add(skuKey);

            const existingBySkuObj = existingBySku[skuKey];

            if (ip.id) {
                // update
                seenIds.add(ip.id);
                const existing = existingById[ip.id];
                if (!existing) {
                    // id provided but not found -> insert instead
                    toInsert.push({ ...ip, kategori_id });
                } else {
                    // check sku conflict: if sku used by other id
                    if (existingBySkuObj && existingBySkuObj.id !== existing.id) {
                        errors.push({ field: `row_${ip.row}`, message: 'SKU already used by other product' });
                        continue;
                    }

                    toUpdate.push({ existing, data: { kategori_produk_id: kategori_id, name: ip.name, sku: ip.sku, stock: ip.stock, price: ip.price, cost_price: ip.cost_price, jasa_pasang: ip.jasa_pasang, ongkir_asuransi: ip.ongkir_asuransi, biaya_overhead: ip.biaya_overhead, is_active: ip.is_active } });
                }
            } else {
                // insert
                if (existingBySkuObj) {
                    errors.push({ field: `row_${ip.row}`, message: 'SKU already exists in database' });
                    continue;
                }
                toInsert.push({ ...ip, kategori_id });
            }
        }

        // Delete products not present in file (soft delete)
        const idsInFile = incomingProducts.filter(p => p.id).map(p => p.id);
        const toDelete = existingProducts.filter(p => p.store_id === storeId && !idsInFile.includes(p.id));

        // Perform DB ops
        let inserted = 0, updated = 0, deleted = 0, skipped = errors.length;

        for (const ins of toInsert) {
            await Product.create({
                id: ins.id || undefined,
                store_id: storeId,
                kategori_produk_id: ins.kategori_id,
                name: ins.name,
                sku: ins.sku,
                stock: ins.stock,
                price: ins.price,
                cost_price: ins.cost_price,
                jasa_pasang: ins.jasa_pasang,
                ongkir_asuransi: ins.ongkir_asuransi,
                biaya_overhead: ins.biaya_overhead,
                is_active: ins.is_active
            }, { transaction });
            inserted++;
        }

        for (const upd of toUpdate) {
            await upd.existing.update(upd.data, { transaction });
            updated++;
        }

        for (const del of toDelete) {
            await del.destroy({ transaction });
            deleted++;
        }

        // --- Process Service sheet ---
        const serviceSheet = workbook.getWorksheet('Service');
        const incomingServices = [];
        if (serviceSheet) {
            // Need to handle multi-row per service as per export format
            let currentService = null;
            serviceSheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
                if (rowNumber === 1) return; // header
                const id = row.getCell('A').value ? String(row.getCell('A').value).trim() : null;
                const kategori_name = row.getCell('B').value ? String(row.getCell('B').value).trim() : null;
                const name = row.getCell('C').value ? String(row.getCell('C').value).trim() : null;
                const price = row.getCell('D').value || 0;
                const cost_price = row.getCell('E').value || 0;
                const biaya_overhead = row.getCell('F').value || 0;
                const description = row.getCell('G').value ? String(row.getCell('G').value).trim() : null;
                const is_active = String(row.getCell('H').value || '').toUpperCase() === 'YES';
                const product_sku = row.getCell('I').value ? String(row.getCell('I').value).trim() : null;
                const product_name = row.getCell('J').value ? String(row.getCell('J').value).trim() : null;

                if (id) {
                    // start new service
                    currentService = { id, kategori_name, name, price, cost_price, biaya_overhead, description, is_active, products: [] };
                    if (product_sku) currentService.products.push({ sku: product_sku, name: product_name });
                    incomingServices.push(currentService);
                } else if (currentService) {
                    // continuation row: only product columns
                    if (product_sku) currentService.products.push({ sku: product_sku, name: product_name });
                }
            });
        }

        // existing services
        const existingServices = await Layanan.findAll({ where: { store_id: storeId }, include: [{ model: ProdukLayanan, as: 'produkLayanan' }], paranoid: false, transaction });
        const existingServiceById = {};
        existingServices.forEach(s => existingServiceById[s.id] = s);

        const serviceKategoriList = await KategoriLayanan.findAll({ attributes: ['id', 'name'] });
        const serviceKategoriMap = {};
        serviceKategoriList.forEach(k => { serviceKategoriMap[k.name] = k.id; });

        const sToInsert = [], sToUpdate = [], sSeenIds = new Set();

        for (const is of incomingServices) {
            const kategori_id = is.kategori_name ? serviceKategoriMap[is.kategori_name] : null;
            if (is.id) {
                sSeenIds.add(is.id);
                const existing = existingServiceById[is.id];
                if (!existing) {
                    sToInsert.push({ ...is, kategori_id });
                } else {
                    sToUpdate.push({ existing, data: { kategori_layanan_id: kategori_id, name: is.name, price: is.price, cost_price: is.cost_price, biaya_overhead: is.biaya_overhead, description: is.description, is_active: is.is_active, products: is.products } });
                }
            } else {
                sToInsert.push({ ...is, kategori_id });
            }
        }

        const sToDelete = existingServices.filter(s => s.store_id === storeId && !sSeenIds.has(s.id));

        let sInserted = 0, sUpdated = 0, sDeleted = 0;

        // Insert services
        for (const ins of sToInsert) {
            const created = await Layanan.create({ id: ins.id || undefined, store_id: storeId, kategori_layanan_id: ins.kategori_id, name: ins.name, price: ins.price, cost_price: ins.cost_price, biaya_overhead: ins.biaya_overhead, description: ins.description, is_active: ins.is_active }, { transaction });
            // link products by sku
            for (const p of ins.products || []) {
                const prod = await Product.findOne({ where: { sku: p.sku, store_id: storeId }, transaction });
                if (prod) {
                    const existingLink = await ProdukLayanan.findOne({ where: { layanan_id: created.id, product_id: prod.id }, paranoid: false, transaction });
                    if (existingLink) {
                        if (existingLink.deletedAt) await existingLink.restore({ transaction });
                    } else {
                        try {
                            await ProdukLayanan.create({ layanan_id: created.id, product_id: prod.id }, { transaction });
                        } catch (err) {
                            logger.warn({ type: 'produk_layanan_create_error', layanan: created.id, sku: p.sku, message: err.message });
                            const conflict = await ProdukLayanan.findOne({ where: { layanan_id: created.id, product_id: prod.id }, paranoid: false, transaction });
                            if (conflict && conflict.deletedAt) {
                                await conflict.restore({ transaction });
                            } else {
                                throw err;
                            }
                        }
                    }
                } else {
                    logger.warn({ type: 'import_service_product_missing', layanan: created.id, sku: p.sku });
                }
            }
            sInserted++;
        }

        // Update services
        for (const upd of sToUpdate) {
            await upd.existing.update({ kategori_layanan_id: upd.data.kategori_layanan_id, name: upd.data.name, price: upd.data.price, cost_price: upd.data.cost_price, biaya_overhead: upd.data.biaya_overhead, description: upd.data.description, is_active: upd.data.is_active }, { transaction });
            // replace produk_layanan links: remove existing then insert from file
            await ProdukLayanan.destroy({ where: { layanan_id: upd.existing.id }, transaction });
            for (const p of upd.data.products || []) {
                const prod = await Product.findOne({ where: { sku: p.sku, store_id: storeId }, transaction });
                if (prod) {
                    const existingLink = await ProdukLayanan.findOne({ where: { layanan_id: upd.existing.id, product_id: prod.id }, paranoid: false, transaction });
                    if (existingLink) {
                        if (existingLink.deletedAt) await existingLink.restore({ transaction });
                    } else {
                        try {
                            await ProdukLayanan.create({ layanan_id: upd.existing.id, product_id: prod.id }, { transaction });
                        } catch (err) {
                            logger.warn({ type: 'produk_layanan_create_error', layanan: upd.existing.id, sku: p.sku, message: err.message });
                            const conflict = await ProdukLayanan.findOne({ where: { layanan_id: upd.existing.id, product_id: prod.id }, paranoid: false, transaction });
                            if (conflict && conflict.deletedAt) {
                                await conflict.restore({ transaction });
                            } else {
                                throw err;
                            }
                        }
                    }
                } else {
                    logger.warn({ type: 'import_service_product_missing', layanan: upd.existing.id, sku: p.sku });
                }
            }
            sUpdated++;
        }

        // Delete services not in file
        for (const del of sToDelete) {
            await del.destroy({ transaction });
            sDeleted++;
        }

        await transaction.commit();

        return { message: 'Import completed', total_inserted: inserted + sInserted, total_updated: updated + sUpdated, total_deleted: deleted + sDeleted, total_skipped: skipped };
    } catch (error) {
        await transaction.rollback();
        logger.error({ type: 'product_import_failed', message: error.message, stack: error.stack });
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to import excel file: ' + error.message, 500);
    }
};

/**
 * Export products and categories to Excel
 * @param {string} storeId 
 * @returns {Promise<Buffer>}
 */
const exportProducts = async (storeId) => {
    try {
        const workbook = new ExcelJS.Workbook();

        // ─── Sheet Product ───
        const productSheet = workbook.addWorksheet('Product');

        // Headers for Product
        const productHeaders = [
            { header: 'id', key: 'id', width: 40 },
            { header: 'kategori_name', key: 'kategori_name', width: 20 },
            { header: 'name', key: 'name', width: 30 },
            { header: 'sku', key: 'sku', width: 20 },
            { header: 'stok', key: 'stock', width: 10 },
            { header: 'price', key: 'price', width: 15 },
            { header: 'cost_price', key: 'cost_price', width: 15 },
            { header: 'jasa_pasang', key: 'jasa_pasang', width: 15 },
            { header: 'ongkir_asuransi', key: 'ongkir_asuransi', width: 15 },
            { header: 'biaya_overhead', key: 'biaya_overhead', width: 15 },
            { header: 'is_active', key: 'is_active', width: 10 }
        ];

        productSheet.columns = productHeaders;

        // Style headers Product: Yellow fill, Bold font
        productSheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFFF00' } // Yellow
            };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });

        // Get Product Data
        const products = await Product.findAll({
            where: { store_id: storeId },
            include: [
                { model: Store, as: 'store', attributes: ['name'] },
                { model: KategoriProduk, as: 'kategori', attributes: ['name'] }
            ],
            order: [['created_at', 'DESC']]
        });

        // Add product rows
        products.forEach(product => {
            productSheet.addRow({
                id: product.id,
                kategori_name: product.kategori?.name || '',
                name: product.name,
                sku: product.sku,
                stock: product.stock,
                price: product.price,
                cost_price: product.cost_price,
                jasa_pasang: product.jasa_pasang,
                ongkir_asuransi: product.ongkir_asuransi,
                biaya_overhead: product.biaya_overhead,
                is_active: product.is_active ? 'YES' : 'NO'
            });
        });

        // ─── Sheet Kategori ───
        const kategoriSheet = workbook.addWorksheet('Product Category');

        // Headers for Kategori
        const kategoriHeaders = [
            { header: 'id', key: 'id', width: 40 },
            { header: 'name', key: 'name', width: 25 },
            { header: 'description', key: 'description', width: 40 },
            { header: 'is_active', key: 'is_active', width: 10 }
        ];

        kategoriSheet.columns = kategoriHeaders;

        // Style headers Kategori: Yellow fill, Bold font
        kategoriSheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFFF00' } // Yellow
            };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });

        const categories = await KategoriProduk.findAll({
            order: [['name', 'ASC']]
        });

        // Add category rows
        categories.forEach(kategori => {
            kategoriSheet.addRow({
                id: kategori.id,
                name: kategori.name,
                description: kategori.description,
                is_active: kategori.is_active ? 'YES' : 'NO'
            });
        });

        //  ─── Sheet Service ───
        const serviceSheet = workbook.addWorksheet('Service');

        // Headers for Service
        const serviceHeaders = [
            { header: 'id', key: 'id', width: 40 },
            { header: 'kategori_name', key: 'kategori_name', width: 20 },
            { header: 'name', key: 'name', width: 30 },
            { header: 'price', key: 'price', width: 15 },
            { header: 'cost_price', key: 'cost_price', width: 15 },
            { header: 'biaya_overhead', key: 'biaya_overhead', width: 15 },
            { header: 'description', key: 'description', width: 40 },
            { header: 'is_active', key: 'is_active', width: 10 },
            { header: 'product_sku', key: 'product_sku', width: 20 },
            { header: 'product_name', key: 'product_name', width: 30 }
        ];

        serviceSheet.columns = serviceHeaders;

        // Style headers Service: Yellow fill, Bold font
        serviceSheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFFF00' } // Yellow
            };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });

        // Get Service Data
        const services = await Layanan.findAll({
            where: { store_id: storeId },
            include: [
                { model: KategoriLayanan, as: 'kategori', attributes: ['name'] },
                {
                    model: ProdukLayanan,
                    as: 'produkLayanan',
                    include: [
                        { model: Product, as: 'product', attributes: ['sku', 'name'] }
                    ]
                }
            ],
            order: [['created_at', 'DESC']]
        });

        // Add service rows
        services.forEach(service => {
            const produkLayananList = service.produkLayanan || [];

            if (produkLayananList.length === 0) {
                // If no products, add one row with empty product fields
                serviceSheet.addRow({
                    id: service.id,
                    kategori_name: service.kategori?.name || '',
                    name: service.name,
                    price: service.price,
                    cost_price: service.cost_price,
                    biaya_overhead: service.biaya_overhead,
                    description: service.description,
                    is_active: service.is_active ? 'YES' : 'NO',
                    product_sku: '',
                    product_name: ''
                });
            } else {
                // If has products, first row contains all data
                const firstProduct = produkLayananList[0];
                serviceSheet.addRow({
                    id: service.id,
                    kategori_name: service.kategori?.name || '',
                    name: service.name,
                    price: service.price,
                    cost_price: service.cost_price,
                    biaya_overhead: service.biaya_overhead,
                    description: service.description,
                    is_active: service.is_active ? 'YES' : 'NO',
                    product_sku: firstProduct.product?.sku || '',
                    product_name: firstProduct.product?.name || ''
                });

                // Subsequent rows only contain product_sku and product_name
                for (let i = 1; i < produkLayananList.length; i++) {
                    const product = produkLayananList[i];
                    serviceSheet.addRow({
                        id: '',
                        kategori_name: '',
                        name: '',
                        price: '',
                        cost_price: '',
                        biaya_overhead: '',
                        description: '',
                        is_active: '',
                        product_sku: product.product?.sku || '',
                        product_name: product.product?.name || ''
                    });
                }
            }
        });

        // ─── Sheet Service Category ───
        const serviceKategoriSheet = workbook.addWorksheet('Service Category');

        // Headers for Service Category
        const serviceKategoriHeaders = [
            { header: 'id', key: 'id', width: 40 },
            { header: 'name', key: 'name', width: 25 },
            { header: 'description', key: 'description', width: 40 },
            { header: 'is_active', key: 'is_active', width: 10 }
        ];

        serviceKategoriSheet.columns = serviceKategoriHeaders;

        // Style headers Service Category: Yellow fill, Bold font
        serviceKategoriSheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFFF00' } // Yellow
            };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });

        const serviceCategories = await KategoriLayanan.findAll({
            order: [['name', 'ASC']]
        });

        // Add service category rows
        serviceCategories.forEach(kategori => {
            serviceKategoriSheet.addRow({
                id: kategori.id,
                name: kategori.name,
                description: kategori.description,
                is_active: kategori.is_active ? 'YES' : 'NO'
            });
        });

        // Generate buffer
        const buffer = await workbook.xlsx.writeBuffer();

        logger.info({
            type: 'product_export_success',
            store_id: storeId,
            product_count: products.length,
            kategori_count: categories.length,
            service_count: services.length,
            service_kategori_count: serviceCategories.length
        });

        return buffer;
    } catch (error) {
        logger.error({
            type: 'product_export_failed',
            message: error.message,
            store_id: storeId,
            stack: error.stack
        });

        if (error instanceof AppError) {
            throw error;
        }

        throw new AppError('Failed to generate excel file: ' + error.message, 500);
    }
};

module.exports = {
    exportProducts
    , importProducts
    , getAllProducts
    , getProductCategoriesList
};

