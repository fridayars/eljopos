const ExcelJS = require('exceljs');
const db = require('../models');
const AppError = require('../utils/app.error');
const logger = require('../utils/logger.util');
const { insertMutasiStok } = require('../utils/mutasiStok.helper');
const { JENIS_MUTASI_STOK } = require('../utils/enums');
const { Product, KategoriProduk, Store, Layanan, KategoriLayanan, ProdukLayanan, LogImport } = db;

/**
 * Helper to safely parse numeric values from Excel cells
 * Handles: null, undefined, formula objects, "NaN" strings, and other non-numeric strings
 */
const parseSafeNumber = (val) => {
    if (val === null || val === undefined) return 0;
    
    let num;
    if (typeof val === 'object' && val.result !== undefined) {
        val = val.result;
    }
    
    if (typeof val === 'string') {
        let clean = val.trim().toLowerCase();
        if (clean === 'nan' || clean === '') return 0;
        
        // Remove currency symbols (e.g., Rp) and spaces, keep digits, commas, dots, and minus
        clean = clean.replace(/[^0-9,.-]/g, '');

        // Handle mixed separators (e.g., 1.200,50 or 1,200.50)
        if (clean.includes(',') && clean.includes('.')) {
            const firstComma = clean.indexOf(',');
            const firstDot = clean.indexOf('.');
            if (firstDot < firstComma) {
                // Indonesian/European format: 1.200,50
                clean = clean.replace(/\./g, '').replace(',', '.');
            } else {
                // Western format: 1,200.50
                clean = clean.replace(/,/g, '');
            }
        } else if (clean.includes(',')) {
            // Only comma: could be decimal (1,5) or thousand (1,200,000)
            const commas = clean.split(',').length - 1;
            if (commas > 1) {
                clean = clean.replace(/,/g, '');
            } else {
                // Single comma: check if followed by exactly 3 digits (likely thousand)
                const parts = clean.split(',');
                if (parts[parts.length - 1].length === 3) {
                    clean = clean.replace(/,/g, '');
                } else {
                    clean = clean.replace(',', '.');
                }
            }
        } else if (clean.includes('.')) {
            // Only dot: could be thousand (1.200) or decimal (1.5)
            const dots = clean.split('.').length - 1;
            if (dots > 1) {
                 clean = clean.replace(/\./g, '');
            } else {
                // Single dot: check if followed by exactly 3 digits (likely thousand)
                const parts = clean.split('.');
                if (parts[parts.length - 1].length === 3) {
                    clean = clean.replace(/\./g, '');
                }
                // else: treat as standard decimal (1.5)
            }
        }
        num = Number(clean);
    } else {
        num = Number(val);
    }

    return isNaN(num) ? 0 : num;
};

/**
 * Get all products with pagination, search and sorting
 * @param {object} opts {page, limit, search, sort}
 * @param {string} storeId
 */
const getAllProducts = async (opts, storeId) => {
    try {
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

        if (opts.status !== undefined && opts.status !== null && opts.status !== '') {
            const statusStr = String(opts.status).toLowerCase();
            if (statusStr === 'true' || statusStr === '1') {
                where.is_active = true;
            } else if (statusStr === 'false' || statusStr === '0') {
                where.is_active = false;
            }
        }

        if (opts.kategori_id && opts.kategori_id !== 'all') {
            where.kategori_produk_id = opts.kategori_id;
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
            kategori_produk_id: p.kategori_produk_id,
            kategori_name: p.kategori?.name || '',
            name: p.name,
            sku: p.sku,
            image_url: p.image_url || null,
            price: Number(p.price),
            cost_price: Number(p.cost_price || 0),
            stock: p.stock,
            jasa_pasang: p.jasa_pasang || 0,
            ongkir_asuransi: p.ongkir_asuransi || 0,
            biaya_overhead: p.biaya_overhead || 0,
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
    } catch (error) {
        logger.error({ type: 'get_all_products_failed', message: error.message, stack: error.stack, store_id: storeId, opts });
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to fetch products: ' + error.message, 500);
    }
};

/**
 * Get all product categories as a simple list (no pagination)
 * @param {object} opts {search, sort}
 */
const getProductCategoriesList = async (opts = {}) => {
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

        const rows = await KategoriProduk.findAll({ where, order });
        const items = rows.map(c => ({ id: c.id, name: c.name, description: c.description, is_active: c.is_active }));

        return items;
    } catch (error) {
        logger.error({ type: 'get_product_categories_list_failed', message: error.message, stack: error.stack, opts });
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to fetch product categories: ' + error.message, 500);
    }
};

/**
 * Import products and services from Excel buffer
 * Only processes sheets: Product and Service. Uses transaction for all mutations.
 * @param {Buffer} buffer
 * @param {string} storeId
 * @param {object} user
 * @param {string} fileName
 */
const importProducts = async (buffer, storeId, user, fileName = 'unknown') => {
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
                const stock = parseSafeNumber(row.getCell('E').value);
                const price = parseSafeNumber(row.getCell('F').value);
                const cost_price = parseSafeNumber(row.getCell('G').value);
                const jasa_pasang = parseSafeNumber(row.getCell('H').value);
                const ongkir_asuransi = parseSafeNumber(row.getCell('I').value);
                const biaya_overhead = parseSafeNumber(row.getCell('J').value);
                const is_active = String(row.getCell('K').value || '').toUpperCase() === 'YES';
                const keterangan_stok = row.getCell('L').value ? String(row.getCell('L').value).trim() : null;

                incomingProducts.push({ id, kategori_name, name, sku, stock, price, cost_price, jasa_pasang, ongkir_asuransi, biaya_overhead, is_active, keterangan_stok, row: rowNumber });
            });
        }

        // Build map for existing products in store
        // paranoid: false → includes soft-deleted, used for ID-based lookups (update/restore)
        const allExistingProducts = await Product.findAll({ where: { store_id: storeId }, paranoid: false, transaction });
        // paranoid: true (default) → only active records, used for SKU uniqueness checks
        const activeExistingProducts = await Product.findAll({ where: { store_id: storeId }, transaction });
        const existingById = {};
        const existingBySku = {};
        allExistingProducts.forEach(p => { existingById[p.id] = p; });
        // Only active (non-deleted) products should block SKU reuse
        activeExistingProducts.forEach(p => { existingBySku[`${p.sku}::${p.store_id}`] = p; });

        const toInsert = [];
        const toUpdate = [];
        const preservedIds = new Set(); // track all existing product IDs accounted for by import
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
                // Has ID -> try update by ID
                preservedIds.add(ip.id);
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
                // No ID -> match by SKU
                if (existingBySkuObj) {
                    // SKU exists in DB -> update existing product by SKU match
                    preservedIds.add(existingBySkuObj.id);
                    toUpdate.push({ existing: existingBySkuObj, data: { kategori_produk_id: kategori_id, name: ip.name, sku: ip.sku, stock: ip.stock, price: ip.price, cost_price: ip.cost_price, jasa_pasang: ip.jasa_pasang, ongkir_asuransi: ip.ongkir_asuransi, biaya_overhead: ip.biaya_overhead, is_active: ip.is_active } });
                } else {
                    // SKU not in DB -> insert new product
                    toInsert.push({ ...ip, kategori_id });
                }
            }
        }

        // Delete products not accounted for by import — only consider active records
        const toDelete = activeExistingProducts.filter(p => p.store_id === storeId && !preservedIds.has(p.id));

        // ══════════════════════════════════════════════════
        // OPTIMIZED DB OPERATIONS (Batch/Bulk)
        // ══════════════════════════════════════════════════

        const Sequelize = db.Sequelize;
        const mutasiStokData = [];

        // --- Build lookup Maps for O(1) keterangan_stok access ---
        const incomingByIdMap = new Map();
        const incomingBySkuMap = new Map();
        incomingProducts.forEach(ip => {
            if (ip.id) incomingByIdMap.set(ip.id, ip);
            if (ip.sku) incomingBySkuMap.set(ip.sku, ip);
        });

        // --- BULK INSERT products ---
        let inserted = 0;
        if (toInsert.length > 0) {
            const insertData = toInsert.map(ins => ({
                id: ins.id || undefined,
                store_id: storeId,
                kategori_produk_id: ins.kategori_id,
                name: ins.name,
                sku: ins.sku,
                stock: Number(ins.stock || 0),
                price: Number(ins.price || 0),
                cost_price: Number(ins.cost_price || 0),
                jasa_pasang: Number(ins.jasa_pasang || 0),
                ongkir_asuransi: Number(ins.ongkir_asuransi || 0),
                biaya_overhead: Number(ins.biaya_overhead || 0),
                is_active: ins.is_active
            }));

            const createdProducts = await Product.bulkCreate(insertData, { transaction, returning: true });
            inserted = createdProducts.length;

            // Collect mutasi stok for new products
            createdProducts.forEach((cp, idx) => {
                const stockVal = Number(toInsert[idx].stock) || 0;
                if (stockVal !== 0) {
                    const incoming = incomingBySkuMap.get(toInsert[idx].sku);
                    mutasiStokData.push({
                        product_id: cp.id,
                        jenis_mutasi: JENIS_MUTASI_STOK.IMPORT_DATA,
                        stok: stockVal,
                        keterangan: incoming?.keterangan_stok || `Import produk baru (stok awal: ${stockVal})`
                    });
                }
            });
        }

        // --- BULK UPDATE products using bulkCreate + updateOnDuplicate ---
        let updated = 0;
        if (toUpdate.length > 0) {
            // Collect mutasi stok BEFORE update (need oldStock)
            for (const upd of toUpdate) {
                const oldStock = Number(upd.existing.stock) || 0;
                const newStock = Number(upd.data.stock) || 0;
                const stokDiff = newStock - oldStock;

                if (stokDiff !== 0) {
                    const incoming = incomingByIdMap.get(upd.existing.id) || incomingBySkuMap.get(upd.existing.sku);
                    mutasiStokData.push({
                        product_id: upd.existing.id,
                        jenis_mutasi: JENIS_MUTASI_STOK.IMPORT_DATA,
                        stok: stokDiff,
                        keterangan: incoming?.keterangan_stok || `Import update stok (${oldStock} → ${newStock})`
                    });
                }
            }

            // Prepare upsert data with existing IDs
            const updateData = toUpdate.map(upd => ({
                id: upd.existing.id,
                store_id: storeId,
                kategori_produk_id: upd.data.kategori_produk_id,
                name: upd.data.name,
                sku: upd.data.sku,
                stock: Number(upd.data.stock || 0),
                price: Number(upd.data.price || 0),
                cost_price: Number(upd.data.cost_price || 0),
                jasa_pasang: Number(upd.data.jasa_pasang || 0),
                ongkir_asuransi: Number(upd.data.ongkir_asuransi || 0),
                biaya_overhead: Number(upd.data.biaya_overhead || 0),
                is_active: upd.data.is_active
            }));

            await Product.bulkCreate(updateData, {
                updateOnDuplicate: ['kategori_produk_id', 'name', 'sku', 'stock', 'price', 'cost_price', 'jasa_pasang', 'ongkir_asuransi', 'biaya_overhead', 'is_active', 'updated_at'],
                transaction
            });
            updated = toUpdate.length;
        }

        // --- BATCH DELETE products ---
        let deleted = 0;
        if (toDelete.length > 0) {
            const deleteIds = toDelete.map(d => d.id);
            await Product.destroy({ where: { id: { [Sequelize.Op.in]: deleteIds } }, transaction });
            deleted = deleteIds.length;
        }

        let skipped = errors.length;

        // --- BULK INSERT mutasi stok ---
        if (mutasiStokData.length > 0) {
            await insertMutasiStok(mutasiStokData, { transaction });
        }

        // ══════════════════════════════════════════════════
        // SERVICE SECTION (Optimized)
        // ══════════════════════════════════════════════════

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
                const price = parseSafeNumber(row.getCell('D').value);
                const cost_price = parseSafeNumber(row.getCell('E').value);
                const biaya_overhead = parseSafeNumber(row.getCell('F').value);
                const description = row.getCell('G').value ? String(row.getCell('G').value).trim() : null;
                const is_active = String(row.getCell('H').value || '').toUpperCase() === 'YES';
                const product_sku = row.getCell('I').value ? String(row.getCell('I').value).trim() : null;
                const product_name = row.getCell('J').value ? String(row.getCell('J').value).trim() : null;

                if (id || name) {
                    // start new service (detected by id OR name)
                    currentService = { id, kategori_name, name, price, cost_price, biaya_overhead, description, is_active, products: [], row: rowNumber };
                    if (product_sku) currentService.products.push({ sku: product_sku, name: product_name });
                    incomingServices.push(currentService);
                } else if (currentService) {
                    // continuation row: only product columns
                    if (product_sku) currentService.products.push({ sku: product_sku, name: product_name });
                }
            });
        }

        // existing services
        // paranoid: false for ID-based lookups (update/restore)
        const allExistingServices = await Layanan.findAll({ where: { store_id: storeId }, include: [{ model: ProdukLayanan, as: 'produkLayanan' }], paranoid: false, transaction });
        // only active services for delete logic
        const activeExistingServices = await Layanan.findAll({ where: { store_id: storeId }, transaction });
        const existingServiceById = {};
        allExistingServices.forEach(s => existingServiceById[s.id] = s);

        const serviceKategoriList = await KategoriLayanan.findAll({ attributes: ['id', 'name'] });
        const serviceKategoriMap = {};
        serviceKategoriList.forEach(k => { serviceKategoriMap[k.name] = k.id; });

        // Build name-based lookup for active services (for matching when no ID)
        const activeServiceByName = {};
        activeExistingServices.forEach(s => { activeServiceByName[`${s.name}::${s.store_id}`] = s; });

        const sToInsert = [], sToUpdate = [], sPreservedIds = new Set();
        const serviceErrors = [];

        for (const is of incomingServices) {
            const kategori_id = is.kategori_name ? serviceKategoriMap[is.kategori_name] : null;
            if (is.id) {
                sPreservedIds.add(is.id);
                const existing = existingServiceById[is.id];
                if (!existing) {
                    sToInsert.push({ ...is, kategori_id });
                } else {
                    sToUpdate.push({ existing, data: { kategori_layanan_id: kategori_id, name: is.name, price: is.price, cost_price: is.cost_price, biaya_overhead: is.biaya_overhead, description: is.description, is_active: is.is_active, products: is.products } });
                }
            } else {
                const nameKey = `${is.name}::${storeId}`;
                const existingByName = activeServiceByName[nameKey];
                if (existingByName) {
                    sPreservedIds.add(existingByName.id);
                    sToUpdate.push({ existing: existingByName, data: { kategori_layanan_id: kategori_id, name: is.name, price: is.price, cost_price: is.cost_price, biaya_overhead: is.biaya_overhead, description: is.description, is_active: is.is_active, products: is.products } });
                } else {
                    sToInsert.push({ ...is, kategori_id });
                }
            }
        }

        const sToDelete = activeExistingServices.filter(s => s.store_id === storeId && !sPreservedIds.has(s.id));

        let sInserted = 0, sUpdated = 0, sDeleted = 0, sSkipped = 0;

        // --- Pre-build SKU → Product Map for service product linking (O(1) lookup) ---
        const allProductsInStore = await Product.findAll({ where: { store_id: storeId }, attributes: ['id', 'sku'], transaction });
        const productBySkuMap = new Map();
        allProductsInStore.forEach(p => productBySkuMap.set(p.sku, p));

        // --- Pre-fetch ALL existing ProdukLayanan for this store's services ---
        const allServiceIds = [...new Set([
            ...sToInsert.filter(s => s.id).map(s => s.id),
            ...sToUpdate.map(s => s.existing.id),
        ])];
        const existingProdukLayananMap = new Map();
        if (allServiceIds.length > 0) {
            const existingLinks = await ProdukLayanan.findAll({
                where: { layanan_id: { [Sequelize.Op.in]: allServiceIds } },
                paranoid: false,
                transaction
            });
            existingLinks.forEach(link => {
                const key = `${link.layanan_id}::${link.product_id}`;
                existingProdukLayananMap.set(key, link);
            });
        }

        // Helper: link products to a service using Maps instead of individual queries
        const linkProductsToService = async (serviceId, serviceName, products) => {
            const linksToCreate = [];
            const linksToRestore = [];

            for (const p of products || []) {
                const prod = productBySkuMap.get(p.sku);
                if (!prod) {
                    serviceErrors.push({ field: `service_${serviceName}`, message: `Product SKU '${p.sku}' not found for service '${serviceName}'` });
                    continue;
                }
                const linkKey = `${serviceId}::${prod.id}`;
                const existingLink = existingProdukLayananMap.get(linkKey);
                if (existingLink) {
                    if (existingLink.deletedAt) linksToRestore.push(existingLink);
                    // else: already exists and not deleted, skip
                } else {
                    linksToCreate.push({ layanan_id: serviceId, product_id: prod.id });
                }
            }

            // Batch restore soft-deleted links
            if (linksToRestore.length > 0) {
                const restoreIds = linksToRestore.map(l => l.id);
                await ProdukLayanan.update({ deleted_at: null }, {
                    where: { id: { [Sequelize.Op.in]: restoreIds } },
                    paranoid: false,
                    transaction
                });
            }

            // Batch insert new links
            if (linksToCreate.length > 0) {
                await ProdukLayanan.bulkCreate(linksToCreate, { transaction });
            }
        };

        // --- BULK INSERT services ---
        if (sToInsert.length > 0) {
            const serviceInsertData = sToInsert.map(ins => ({
                id: ins.id || undefined,
                store_id: storeId,
                kategori_layanan_id: ins.kategori_id,
                name: ins.name,
                price: Number(ins.price || 0),
                cost_price: Number(ins.cost_price || 0),
                biaya_overhead: Number(ins.biaya_overhead || 0),
                description: ins.description,
                is_active: ins.is_active
            }));

            const createdServices = await Layanan.bulkCreate(serviceInsertData, { transaction, returning: true });
            sInserted = createdServices.length;

            // Link products for each newly created service
            for (let i = 0; i < createdServices.length; i++) {
                await linkProductsToService(createdServices[i].id, sToInsert[i].name, sToInsert[i].products);
            }
        }

        // --- BULK UPDATE services ---
        if (sToUpdate.length > 0) {
            const serviceUpdateData = sToUpdate.map(upd => ({
                id: upd.existing.id,
                store_id: storeId,
                kategori_layanan_id: upd.data.kategori_layanan_id,
                name: upd.data.name,
                price: Number(upd.data.price || 0),
                cost_price: Number(upd.data.cost_price || 0),
                biaya_overhead: Number(upd.data.biaya_overhead || 0),
                description: upd.data.description,
                is_active: upd.data.is_active
            }));

            await Layanan.bulkCreate(serviceUpdateData, {
                updateOnDuplicate: ['kategori_layanan_id', 'name', 'price', 'cost_price', 'biaya_overhead', 'description', 'is_active', 'updated_at'],
                transaction
            });
            sUpdated = sToUpdate.length;

            // Batch delete old produk_layanan links, then re-link
            const updateServiceIds = sToUpdate.map(u => u.existing.id);
            await ProdukLayanan.destroy({ where: { layanan_id: { [Sequelize.Op.in]: updateServiceIds } }, transaction });

            // Re-link products for each updated service
            for (const upd of sToUpdate) {
                await linkProductsToService(upd.existing.id, upd.data.name, upd.data.products);
            }
        }

        // --- BATCH DELETE services ---
        if (sToDelete.length > 0) {
            const sDeleteIds = sToDelete.map(d => d.id);
            await Layanan.destroy({ where: { id: { [Sequelize.Op.in]: sDeleteIds } }, transaction });
            sDeleted = sDeleteIds.length;
        }

        // Insert LogImport
        const allErrors = [...(errors.length > 0 ? errors : []), ...(serviceErrors.length > 0 ? serviceErrors : [])];
        await LogImport.create({
            user_id: user.user_id,
            store_id: storeId,
            file_name: fileName,
            total_inserted: inserted + sInserted,
            total_updated: updated + sUpdated,
            total_deleted: deleted + sDeleted,
            total_skipped: skipped + sSkipped,
            errors: allErrors.length > 0 ? allErrors : null
        }, { transaction });

        await transaction.commit();

        const result = {
            message: 'Import completed',
            product: {
                inserted,
                updated,
                deleted,
                skipped,
                errors: errors.length > 0 ? errors : undefined
            },
            service: {
                inserted: sInserted,
                updated: sUpdated,
                deleted: sDeleted,
                skipped: sSkipped,
                errors: serviceErrors.length > 0 ? serviceErrors : undefined
            }
        };

        return result;
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
            { header: 'is_active', key: 'is_active', width: 10 },
            { header: 'keterangan_stok', key: 'keterangan_stok', width: 20 },
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

/**
 * Create Product Category
 * @param {object} data
 */
const createCategory = async (data) => {
    const transaction = await db.sequelize.transaction();
    try {
        const category = await KategoriProduk.create(data, { transaction });
        await transaction.commit();
        return category;
    } catch (error) {
        await transaction.rollback();
        logger.error({ type: 'create_category_failed', message: error.message, stack: error.stack, data });
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to create product category: ' + error.message, 500);
    }
};

/**
 * Update Product Category
 * @param {string} id
 * @param {object} data
 */
const updateCategory = async (id, data) => {
    const transaction = await db.sequelize.transaction();
    try {
        const category = await KategoriProduk.findByPk(id, { transaction });
        if (!category) {
            await transaction.rollback();
            throw new AppError('Category not found', 404);
        }
        await category.update(data, { transaction });
        await transaction.commit();
        return category;
    } catch (error) {
        await transaction.rollback();
        logger.error({ type: 'update_category_failed', message: error.message, stack: error.stack, id, data });
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to update product category: ' + error.message, 500);
    }
};

/**
 * Delete Product Category
 * @param {string} id
 */
const deleteCategory = async (id) => {
    const transaction = await db.sequelize.transaction();
    try {
        const category = await KategoriProduk.findByPk(id, { transaction });
        if (!category) {
            await transaction.rollback();
            throw new AppError('Category not found', 404);
        }

        // Check if category is used by products
        const productCount = await Product.count({ where: { kategori_produk_id: id }, transaction });
        if (productCount > 0) {
            await transaction.rollback();
            throw new AppError('Cannot delete category. It is used by one or more products.', 400);
        }

        await category.destroy({ transaction });
        await transaction.commit();
        return category;
    } catch (error) {
        await transaction.rollback();
        logger.error({ type: 'delete_category_failed', message: error.message, stack: error.stack, id });
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to delete product category: ' + error.message, 500);
    }
};

/**
 * Create a new product
 * @param {object} data
 * @param {string} storeId
 */
const createProduct = async (data, storeId) => {
    const transaction = await db.sequelize.transaction();
    try {
        // Check if kategori exists
        const kategori = await KategoriProduk.findByPk(data.kategori_produk_id, { transaction });
        if (!kategori) {
            await transaction.rollback();
            throw new AppError('Product category not found', 404);
        }

        // Check SKU uniqueness per store
        const existingSku = await Product.findOne({
            where: { sku: data.sku, store_id: storeId },
            transaction
        });

        if (existingSku) {
            await transaction.rollback();
            throw new AppError('SKU already exists in this store', 400);
        }

        const product = await Product.create({
            ...data,
            store_id: storeId
        }, { transaction });

        await transaction.commit();
        return product;
    } catch (error) {
        await transaction.rollback();
        logger.error({ type: 'create_product_failed', message: error.message, stack: error.stack, data, store_id: storeId });
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to create product: ' + error.message, 500);
    }
};

/**
 * Update an existing product
 * @param {string} id
 * @param {object} data
 * @param {string} storeId
 * @param {object} user - Current user object
 */
const updateProduct = async (id, data, storeId, user = null) => {
    const transaction = await db.sequelize.transaction();
    try {
        const product = await Product.findOne({ where: { id, store_id: storeId }, transaction });
        if (!product) {
            await transaction.rollback();
            throw new AppError('Product not found', 404);
        }

        if (data.kategori_produk_id && data.kategori_produk_id !== product.kategori_produk_id) {
            const kategori = await KategoriProduk.findByPk(data.kategori_produk_id, { transaction });
            if (!kategori) {
                await transaction.rollback();
                throw new AppError('Product category not found', 404);
            }
        }

        if (data.sku && data.sku !== product.sku) {
            const existingSku = await Product.findOne({
                where: { sku: data.sku, store_id: storeId },
                transaction
            });

            if (existingSku && existingSku.id !== id) {
                await transaction.rollback();
                throw new AppError('SKU already exists in this store', 400);
            }
        }

        // Handle stock adjustments
        const stockAdjustmentAdd = Number(data.stockAdjustmentAdd) || 0;
        const stockAdjustmentSubtract = Number(data.stockAdjustmentSubtract) || 0;
        const stockAdjustmentNotes = data.stockAdjustmentNotes || '';
        let mutasiStokData = null;

        if (stockAdjustmentAdd > 0 || stockAdjustmentSubtract > 0) {
            if (stockAdjustmentAdd > 0 && stockAdjustmentSubtract > 0) {
                await transaction.rollback();
                throw new AppError('Tidak bisa menambahkan dan mengurangi stok sekaligus', 400);
            }

            let stokDiff = 0;
            let jenisMutasi = null;
            let keterangan = stockAdjustmentNotes;

            if (stockAdjustmentAdd > 0) {
                stokDiff = stockAdjustmentAdd;
                jenisMutasi = JENIS_MUTASI_STOK.PENAMBAHAN_STOK;
                await product.increment('stock', { by: stockAdjustmentAdd, transaction });
                keterangan = `Penambahan stok: ${keterangan}`;
            } else if (stockAdjustmentSubtract > 0) {
                stokDiff = -stockAdjustmentSubtract;
                jenisMutasi = JENIS_MUTASI_STOK.PENGURANGAN_STOK;
                if (product.stock < stockAdjustmentSubtract) {
                    await transaction.rollback();
                    throw new AppError('Stok tidak cukup untuk pengurangan', 400);
                }
                await product.decrement('stock', { by: stockAdjustmentSubtract, transaction });
                keterangan = `Pengurangan stok: ${keterangan}`;
            }

            // Create mutasi stok record
            mutasiStokData = {
                product_id: id,
                jenis_mutasi: jenisMutasi,
                stok: stokDiff,
                keterangan: keterangan,
                user_id: user?.user_id
            };

            await insertMutasiStok(mutasiStokData, { transaction });
        }

        // Remove stock adjustment fields from data before update
        const { stockAdjustmentAdd: _, stockAdjustmentSubtract: __, stockAdjustmentNotes: ___, ...updateData } = data;

        // Update product data except stock adjustment fields
        await product.update(updateData, { transaction });

        await transaction.commit();

        // Return updated product with original product data plus stock adjustment info if needed
        return {
            ...product.toJSON(),
            stockAdjustment: stockAdjustmentAdd > 0 || stockAdjustmentSubtract > 0 ? {
                add: stockAdjustmentAdd,
                subtract: stockAdjustmentSubtract,
                notes: stockAdjustmentNotes
            } : null
        };
    } catch (error) {
        await transaction.rollback();
        logger.error({ type: 'update_product_failed', message: error.message, stack: error.stack, id, data, store_id: storeId });
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to update product: ' + error.message, 500);
    }
};

/**
 * Delete a product (Soft delete)
 * @param {string} id
 * @param {string} storeId
 */
const deleteProduct = async (id, storeId) => {
    const transaction = await db.sequelize.transaction();
    try {
        const product = await Product.findOne({ where: { id, store_id: storeId }, transaction });
        if (!product) {
            await transaction.rollback();
            throw new AppError('Product not found', 404);
        }

        await product.destroy({ transaction });
        await transaction.commit();

        return { message: 'Product deleted successfully' };
    } catch (error) {
        await transaction.rollback();
        logger.error({ type: 'delete_product_failed', message: error.message, stack: error.stack, id, store_id: storeId });
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to delete product: ' + error.message, 500);
    }
};

/**
 * Update product status
 * @param {string} id
 * @param {boolean} isActive
 * @param {string} storeId
 */
const updateProductStatus = async (id, isActive, storeId) => {
    const transaction = await db.sequelize.transaction();
    try {
        const product = await Product.findOne({ where: { id, store_id: storeId }, transaction });
        if (!product) {
            await transaction.rollback();
            throw new AppError('Product not found', 404);
        }

        await product.update({ is_active: isActive }, { transaction });
        await transaction.commit();

        return { message: `Product ${isActive ? 'activated' : 'deactivated'} successfully` };
    } catch (error) {
        await transaction.rollback();
        logger.error({ type: 'update_product_status_failed', message: error.message, stack: error.stack, id, is_active: isActive, store_id: storeId });
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to update product status: ' + error.message, 500);
    }
};

/**
 * Transfer Stock between stores
 * @param {object} data { sourceBranch, destinationBranch, items }
 * @param {string} userId
 */
const transferStock = async (data, userId) => {
    let transaction;
    try {
        const { sourceBranch, destinationBranch, items } = data;

        if (sourceBranch === destinationBranch) {
            throw new AppError('Source and destination branches cannot be the same', 400);
        }

        if (!items || items.length === 0) {
            throw new AppError('No items to transfer', 400);
        }

        transaction = await db.sequelize.transaction();

        const mutasiStokData = [];

        for (const item of items) {
            const { productId, quantity } = item;

            if (!quantity || quantity <= 0) {
                throw new AppError('Invalid transfer quantity', 400);
            }

            // 1. Get source product
            const sourceProduct = await Product.findOne({
                where: { id: productId, store_id: sourceBranch },
                transaction
            });

            if (!sourceProduct) {
                throw new AppError(`Product not found in source branch`, 404);
            }

            if (sourceProduct.stock < quantity) {
                throw new AppError(`Insufficient stock for product ${sourceProduct.name} in source branch`, 400);
            }

            // 2. Locate destination product by SKU
            if (!sourceProduct.sku) {
                throw new AppError(`Product ${sourceProduct.name} has no SKU, cannot transfer`, 400);
            }

            const destinationProduct = await Product.findOne({
                where: { sku: sourceProduct.sku, store_id: destinationBranch },
                transaction
            });

            if (!destinationProduct) {
                throw new AppError(`Product SKU ${sourceProduct.sku} not found in destination branch`, 404);
            }

            // 3. Update stock
            await sourceProduct.decrement('stock', { by: quantity, transaction });
            await destinationProduct.increment('stock', { by: quantity, transaction });

            // 4. Create log
            const logTransfer = await db.LogTransferStok.create({
                product_id: sourceProduct.id,
                from_store_id: sourceBranch,
                to_store_id: destinationBranch,
                quantity: quantity,
                user_id: userId
            }, { transaction });

            // 5. Collect mutasi stok (TRANSFER_STOK untuk source, TRANSFER_STOK untuk destination)
            mutasiStokData.push({
                product_id: sourceProduct.id,
                jenis_mutasi: JENIS_MUTASI_STOK.TRANSFER_STOK,
                reference_id: logTransfer.id,
                stok: -quantity,
                keterangan: `Transfer ke toko tujuan`
            });

            mutasiStokData.push({
                product_id: destinationProduct.id,
                jenis_mutasi: JENIS_MUTASI_STOK.TRANSFER_STOK,
                reference_id: logTransfer.id,
                stok: quantity,
                keterangan: `Transfer dari toko asal`
            });
        }

        // 6. Bulk insert mutasi stok
        if (mutasiStokData.length > 0) {
            await insertMutasiStok(mutasiStokData, { transaction });
        }

        await transaction.commit();
        return { message: 'Stock transfer successful' };
    } catch (error) {
        if (transaction) {
            await transaction.rollback();
        }
        logger.error({
            type: 'transfer_stock_failed',
            message: error.message,
            stack: error.stack,
            data,
            user_id: userId
        });
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to transfer stock: ' + error.message, 500);
    }
};

/**
 * Get stock mutation history with pagination
 * @param {object} opts {page, limit, product_id, store_id}
 */
const getStockMutations = async (opts) => {
    try {
        const page = opts.page || 1;
        const limit = opts.limit || 10;
        const offset = (page - 1) * limit;
        const { product_id, search, start_date, end_date } = opts;

        const where = {};
        if (product_id) {
            where.product_id = product_id;
        }

        if (start_date || end_date) {
            const Sequelize = db.Sequelize;
            where.created_at = {};
            if (start_date) {
                where.created_at[Sequelize.Op.gte] = new Date(start_date + 'T00:00:00.000Z');
            }
            if (end_date) {
                where.created_at[Sequelize.Op.lte] = new Date(end_date + 'T23:59:59.999Z');
            }
        }

        const include = [
            {
                model: db.Product,
                as: 'product',
                attributes: ['id', 'name', 'sku']
            }
        ];

        if (search) {
            const Sequelize = db.Sequelize;
            include[0].where = {
                [Sequelize.Op.or]: [
                    { name: { [Sequelize.Op.iLike]: `%${search}%` } },
                    { sku: { [Sequelize.Op.iLike]: `%${search}%` } }
                ]
            };
        }

        const { count, rows } = await db.MutasiStokProduk.findAndCountAll({
            where,
            include,
            order: [['created_at', 'DESC']],
            limit,
            offset
        });

        const total_pages = Math.ceil(count / limit);

        const items = rows.map(mutasi => ({
            id: mutasi.id,
            product_id: mutasi.product_id,
            product_name: mutasi.product?.name || 'Unknown Product',
            product_sku: mutasi.product?.sku || 'Unknown SKU',
            jenis_mutasi: mutasi.jenis_mutasi.replace('_', ' '),
            keterangan: mutasi.keterangan,
            stok: mutasi.stok,
            created_at: mutasi.created_at,
            updated_at: mutasi.updated_at
        }));

        return {
            items,
            pagination: {
                page,
                limit,
                total: count,
                total_pages,
                has_next: page < total_pages,
                has_prev: page > 1
            }
        };
    } catch (error) {
        logger.error({ type: 'get_stock_mutations_failed', message: error.message, stack: error.stack, opts });
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to fetch stock mutations: ' + error.message, 500);
    }
};

module.exports = {
    exportProducts,
    importProducts,
    getAllProducts,
    getProductCategoriesList,
    createCategory,
    updateCategory,
    deleteCategory,
    createProduct,
    updateProduct,
    deleteProduct,
    updateProductStatus,
    transferStock,
    getStockMutations
};

