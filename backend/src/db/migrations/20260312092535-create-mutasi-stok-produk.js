'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('mutasi_stok_produk', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
            },
            jenis_mutasi: {
                type: Sequelize.STRING,
                allowNull: false
            },
            product_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'products',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            reference_id: {
                type: Sequelize.UUID,
                allowNull: true
            },
            keterangan: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            stok: {
                type: Sequelize.INTEGER,
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

        await queryInterface.addIndex('mutasi_stok_produk', ['product_id']);
        await queryInterface.addIndex('mutasi_stok_produk', ['reference_id']);
        await queryInterface.addIndex('mutasi_stok_produk', ['jenis_mutasi']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('mutasi_stok_produk');
    }
};
