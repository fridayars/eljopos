'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('stock_opname_details', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
            },
            stock_opname_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'stock_opnames',
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
                onDelete: 'CASCADE'
            },
            stok_sistem: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            stok_fisik: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            selisih: {
                type: Sequelize.INTEGER,
                allowNull: false
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

        await queryInterface.addIndex('stock_opname_details', ['stock_opname_id']);
        await queryInterface.addIndex('stock_opname_details', ['product_id']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('stock_opname_details');
    }
};
