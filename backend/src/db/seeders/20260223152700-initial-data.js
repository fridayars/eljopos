'use strict';

const bcrypt = require('bcrypt');
const crypto = require('crypto');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const now = new Date();

        // ─── 1. Roles ───
        const adminRoleId = crypto.randomUUID();
        await queryInterface.bulkInsert('roles', [
            { id: adminRoleId, name: 'Administrator', is_active: true, created_at: now, updated_at: now }
        ]);

        // ─── 2. Akses Role (Permissions) ───
        const permissions = [
            'customer.view', 'customer.add', 'customer.edit', 'customer.delete',
            'product.view', 'product.add', 'product.edit', 'product.delete',
            'layanan.view', 'layanan.add', 'layanan.edit', 'layanan.delete',
            'transaction.view', 'transaction.create',
            'laporan.view',
            'store.view', 'store.edit',
            'user.view', 'user.add', 'user.edit', 'user.delete',
            'role.view', 'role.edit'
        ];

        await queryInterface.bulkInsert('akses_role',
            permissions.map(permission => ({
                id: crypto.randomUUID(),
                role_id: adminRoleId,
                permission,
                created_at: now,
                updated_at: now
            }))
        );

        // ─── 3. Stores ───
        const storeJombangId = crypto.randomUUID();
        const storeMojokertoId = crypto.randomUUID();
        const storeIpromaxId = crypto.randomUUID();

        await queryInterface.bulkInsert('stores', [
            { id: storeJombangId, name: 'Eljo Store Jombang', address: 'Jombang', phone: null, is_active: true, created_at: now, updated_at: now },
            { id: storeMojokertoId, name: 'Eljo Store Mojokerto', address: 'Mojokerto', phone: null, is_active: true, created_at: now, updated_at: now },
            { id: storeIpromaxId, name: 'Ipromax Mojokerto', address: 'Mojokerto', phone: null, is_active: true, created_at: now, updated_at: now }
        ]);

        // ─── 4. User (Owner/Administrator) ───
        const hashedPassword = await bcrypt.hash('eljo123!!', 10);

        await queryInterface.bulkInsert('users', [
            {
                id: crypto.randomUUID(),
                role_id: adminRoleId,
                username: 'owner',
                email: 'owner@eljo.com',
                password: hashedPassword,
                is_active: true,
                created_at: now,
                updated_at: now
            }
        ]);

        // ─── 5. Kategori Layanan ───
        await queryInterface.bulkInsert('kategori_layanan', [
            { id: crypto.randomUUID(), name: 'Jasa Pasang', description: null, created_at: now, updated_at: now },
            { id: crypto.randomUUID(), name: 'Jasa Service', description: null, created_at: now, updated_at: now }
        ]);

        // ─── 6. Kategori Produk ───
        await queryInterface.bulkInsert('kategori_produk', [
            { id: crypto.randomUUID(), name: 'Battery', description: null, created_at: now, updated_at: now },
            { id: crypto.randomUUID(), name: 'LCD', description: null, created_at: now, updated_at: now },
            { id: crypto.randomUUID(), name: 'Aksesoris', description: null, created_at: now, updated_at: now }
        ]);
    },

    async down(queryInterface, Sequelize) {
        // Hapus dalam urutan terbalik (karena foreign keys)
        await queryInterface.bulkDelete('users', { username: 'owner' });
        await queryInterface.bulkDelete('akses_role', null, {});
        await queryInterface.bulkDelete('roles', { name: 'Administrator' });
        await queryInterface.bulkDelete('stores', { name: ['Eljo Store Jombang', 'Eljo Store Mojokerto', 'Ipromax Mojokerto'] });
        await queryInterface.bulkDelete('kategori_layanan', { name: ['Jasa Pasang', 'Jasa Service'] });
        await queryInterface.bulkDelete('kategori_produk', { name: ['Battery', 'LCD', 'Aksesoris'] });
    }
};
