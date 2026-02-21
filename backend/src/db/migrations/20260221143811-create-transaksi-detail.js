'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('transaksi_detail', {
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
            item_type: {
                type: Sequelize.STRING(20),
                allowNull: false
            },
            item_id: {
                type: Sequelize.UUID,
                allowNull: false
            },
            item_name: {
                type: Sequelize.STRING(255),
                allowNull: false
            },
            kategori_name: {
                type: Sequelize.STRING(255)
            },
            price: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: false
            },
            quantity: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            subtotal: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: false
            }
        });

        await queryInterface.addIndex('transaksi_detail', ['transaksi_id']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('transaksi_detail');
    }
};
