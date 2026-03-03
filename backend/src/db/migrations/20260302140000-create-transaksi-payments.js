'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const tables = await queryInterface.showAllTables();
        if (tables.includes('transaksi_payments')) {
            return;
        }
        // 1. Buat tabel transaksi_payments untuk split payment
        await queryInterface.createTable('transaksi_payments', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
            },
            transaksi_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'transaksi',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            payment_method: {
                type: Sequelize.STRING(50),
                allowNull: false
            },
            nominal: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: false
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            deleted_at: {
                type: Sequelize.DATE
            }
        });

        // Index untuk mempercepat query berdasarkan transaksi_id
        await queryInterface.addIndex('transaksi_payments', ['transaksi_id']);

        // 2. Hapus kolom payment_method dari tabel transaksi (sudah dipindah ke transaksi_payments)
        await queryInterface.removeColumn('transaksi', 'payment_method');
    },

    async down(queryInterface, Sequelize) {
        const tables = await queryInterface.showAllTables();
        if (!tables.includes('transaksi_payments')) {
            return;
        }
        // 1. Tambahkan kembali kolom payment_method ke tabel transaksi
        await queryInterface.addColumn('transaksi', 'payment_method', {
            type: Sequelize.STRING(50)
        });

        // 2. Hapus tabel transaksi_payments
        await queryInterface.dropTable('transaksi_payments');
    }
};
