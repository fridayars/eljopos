'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('stok', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
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
            store_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'stores',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            quantity: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });

        await queryInterface.addConstraint('stok', {
            fields: ['product_id', 'store_id'],
            type: 'unique',
            name: 'unique_stok_product_store'
        });

        await queryInterface.addIndex('stok', ['product_id', 'store_id']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('stok');
    }
};
