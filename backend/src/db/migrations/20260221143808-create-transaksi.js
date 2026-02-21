'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('transaksi', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
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
            customer_id: {
                type: Sequelize.UUID,
                allowNull: true, // Walk-in customer might not be registered
                references: {
                    model: 'customers',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            receipt_number: {
                type: Sequelize.STRING(100),
                allowNull: false,
                unique: true
            },
            total_amount: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: false
            },
            payment_method: {
                type: Sequelize.STRING(50)
            },
            payment_status: {
                type: Sequelize.STRING(50)
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });

        // Rule 8.1 in Guide -> Tambahkan index pada transaksi (store_id, created_at)
        await queryInterface.addIndex('transaksi', ['store_id', 'created_at']);
        await queryInterface.addIndex('transaksi', ['user_id']);
        await queryInterface.addIndex('transaksi', ['customer_id']);
        await queryInterface.addIndex('transaksi', ['receipt_number']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('transaksi');
    }
};
