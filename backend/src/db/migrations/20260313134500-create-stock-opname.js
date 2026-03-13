'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('stock_opnames', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
            },
            opname_number: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            store_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'stores',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            user_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            tanggal: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW
            },
            status: {
                type: Sequelize.ENUM('DRAFT', 'COMPLETED', 'CANCELLED'),
                allowNull: false,
                defaultValue: 'DRAFT'
            },
            keterangan: {
                type: Sequelize.TEXT,
                allowNull: true
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

        await queryInterface.addIndex('stock_opnames', ['store_id']);
        await queryInterface.addIndex('stock_opnames', ['user_id']);
        await queryInterface.addIndex('stock_opnames', ['opname_number']);
        await queryInterface.addIndex('stock_opnames', ['status']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('stock_opnames');
    }
};
