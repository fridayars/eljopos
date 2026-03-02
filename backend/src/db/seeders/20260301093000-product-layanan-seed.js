"use strict";

const crypto = require('crypto');

module.exports = {
    async up(queryInterface, Sequelize) {
        const now = new Date();

        const product1Id = 'f1a7e6d2-1111-4a2b-8888-aaaaaaaaaaaa';
        const product2Id = 'f1a7e6d2-2222-4a2b-8888-bbbbbbbbbbbb';

        // Upsert products by performing UPDATE then conditional INSERT (avoids ON CONFLICT requiring a unique constraint)
        // Product A
        await queryInterface.sequelize.query(`
            UPDATE products SET kategori_produk_id = 'de4a152e-51ab-43f0-8a8c-956707eb168a', name = 'Test Product A', stock = 10, price = 100000.00, cost_price = 70000.00, image_url = NULL, is_active = true, updated_at = '${now.toISOString()}'
            WHERE sku = 'TPA-001' AND store_id = '82d42752-07a9-4ce7-9817-f049bb17f2b2';
        `);

        await queryInterface.sequelize.query(`
            INSERT INTO products (id, store_id, kategori_produk_id, name, sku, stock, price, cost_price, image_url, is_active, created_at, updated_at)
            SELECT '${product1Id}', '82d42752-07a9-4ce7-9817-f049bb17f2b2', 'de4a152e-51ab-43f0-8a8c-956707eb168a', 'Test Product A', 'TPA-001', 10, 100000.00, 70000.00, NULL, true, '${now.toISOString()}', '${now.toISOString()}'
            WHERE NOT EXISTS (SELECT 1 FROM products WHERE sku = 'TPA-001' AND store_id = '82d42752-07a9-4ce7-9817-f049bb17f2b2');
        `);

        // Product B
        await queryInterface.sequelize.query(`
            UPDATE products SET kategori_produk_id = 'de4a152e-51ab-43f0-8a8c-956707eb168a', name = 'Test Product B', stock = 10, price = 150000.00, cost_price = 90000.00, image_url = NULL, is_active = true, updated_at = '${now.toISOString()}'
            WHERE sku = 'TPB-001' AND store_id = '82d42752-07a9-4ce7-9817-f049bb17f2b2';
        `);

        await queryInterface.sequelize.query(`
            INSERT INTO products (id, store_id, kategori_produk_id, name, sku, stock, price, cost_price, image_url, is_active, created_at, updated_at)
            SELECT '${product2Id}', '82d42752-07a9-4ce7-9817-f049bb17f2b2', 'de4a152e-51ab-43f0-8a8c-956707eb168a', 'Test Product B', 'TPB-001', 10, 150000.00, 90000.00, NULL, true, '${now.toISOString()}', '${now.toISOString()}'
            WHERE NOT EXISTS (SELECT 1 FROM products WHERE sku = 'TPB-001' AND store_id = '82d42752-07a9-4ce7-9817-f049bb17f2b2');
        `);

        // Create layanan (upsert)
        const layananId = 'c2b8d7e3-3333-4b2b-9999-cccccccccccc';
        const layananId2 = 'c2b8d7e3-4444-4b2b-9999-dddddddddddd';

        await queryInterface.sequelize.query(`
            INSERT INTO layanan (id, store_id, kategori_layanan_id, name, price, cost_price, biaya_overhead, description, is_active, created_at, updated_at)
            VALUES
            ('${layananId}', '82d42752-07a9-4ce7-9817-f049bb17f2b2', '32353306-e600-4a1f-b737-dbd2ab84fd3a', 'Test Service Alpha', 50000, 30000, 5000, 'Service for testing linking to products', true, '${now.toISOString()}', '${now.toISOString()}'),
            ('${layananId2}', '82d42752-07a9-4ce7-9817-f049bb17f2b2', '32353306-e600-4a1f-b737-dbd2ab84fd3a', 'Test Service Beta', 50000, 30000, 5000, 'Service for testing linking to products', true, '${now.toISOString()}', '${now.toISOString()}')
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                price = EXCLUDED.price,
                cost_price = EXCLUDED.cost_price,
                biaya_overhead = EXCLUDED.biaya_overhead,
                description = EXCLUDED.description,
                is_active = EXCLUDED.is_active,
                updated_at = EXCLUDED.updated_at;
        `);

        // Remove any existing links to avoid duplicates, then insert
        await queryInterface.sequelize.query(`DELETE FROM produk_layanan WHERE layanan_id IN ('${layananId}','${layananId2}') AND product_id IN ('${product1Id}','${product2Id}')`);

        await queryInterface.bulkInsert('produk_layanan', [
            { id: crypto.randomUUID(), layanan_id: layananId, product_id: product1Id, created_at: now, updated_at: now },
            { id: crypto.randomUUID(), layanan_id: layananId, product_id: product2Id, created_at: now, updated_at: now },
            { id: crypto.randomUUID(), layanan_id: layananId2, product_id: product1Id, created_at: now, updated_at: now },
            { id: crypto.randomUUID(), layanan_id: layananId2, product_id: product2Id, created_at: now, updated_at: now }
        ]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('produk_layanan', { layanan_id: ['c2b8d7e3-3333-4b2b-9999-cccccccccccc', 'c2b8d7e3-4444-4b2b-9999-dddddddddddd'] }, {});
        await queryInterface.bulkDelete('layanan', { id: ['c2b8d7e3-3333-4b2b-9999-cccccccccccc', 'c2b8d7e3-4444-4b2b-9999-dddddddddddd'] }, {});
        await queryInterface.bulkDelete('products', { sku: ['TPA-001', 'TPB-001'] }, {});
    }
};
