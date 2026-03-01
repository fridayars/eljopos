const ExcelJS = require('exceljs');
const db = require('../models');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const { Product, KategoriProduk, Store } = db;

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
        const kategoriSheet = workbook.addWorksheet('Kategori');

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

        // Generate buffer
        const buffer = await workbook.xlsx.writeBuffer();

        logger.info({
            type: 'product_export_success',
            store_id: storeId,
            product_count: products.length,
            kategori_count: categories.length
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
};
