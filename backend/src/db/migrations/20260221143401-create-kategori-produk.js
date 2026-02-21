'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('kategori_produk', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
            },
            name: {
                type: Sequelize.STRING(255)
            },
            description: {
                type: Sequelize.TEXT
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
            }
        });

        await queryInterface.addIndex('kategori_produk', ['name']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('kategori_produk');
    }
};
