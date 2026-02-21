'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('log_transfer_stok', {
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
            from_store_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'stores',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            to_store_id: {
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
                allowNull: false
            },
            user_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });

        await queryInterface.addIndex('log_transfer_stok', ['product_id']);
        await queryInterface.addIndex('log_transfer_stok', ['from_store_id']);
        await queryInterface.addIndex('log_transfer_stok', ['to_store_id']);
        await queryInterface.addIndex('log_transfer_stok', ['user_id']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('log_transfer_stok');
    }
};
