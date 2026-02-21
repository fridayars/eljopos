'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('produk_layanan', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
            },
            layanan_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'layanan',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            product_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'products',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            quantity: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 1
            }
        });

        await queryInterface.addConstraint('produk_layanan', {
            fields: ['layanan_id', 'product_id'],
            type: 'unique',
            name: 'unique_produk_layanan'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('produk_layanan');
    }
};
