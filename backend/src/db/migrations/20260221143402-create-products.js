'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('products', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
            },
            kategori_produk_id: {
                type: Sequelize.UUID,
                references: {
                    model: 'kategori_produk',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            name: {
                type: Sequelize.STRING(255)
            },
            sku: {
                type: Sequelize.STRING(100),
                unique: true
            },
            price: {
                type: Sequelize.DECIMAL(15, 2)
            },
            cost_price: {
                type: Sequelize.DECIMAL(15, 2)
            },
            image_url: {
                type: Sequelize.STRING
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
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

        await queryInterface.addIndex('products', ['sku']);
        await queryInterface.addIndex('products', ['kategori_produk_id']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('products');
    }
};
