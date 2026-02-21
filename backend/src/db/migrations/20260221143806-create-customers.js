'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('customers', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
            },
            name: {
                type: Sequelize.STRING(255),
                allowNull: false
            },
            phone: {
                type: Sequelize.STRING(50),
                allowNull: false,
                unique: true
            },
            email: {
                type: Sequelize.STRING(255)
            },
            address: {
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

        // Rule 8.1 in Guide -> Tambahkan index pada customers (phone)
        await queryInterface.addIndex('customers', ['phone']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('customers');
    }
};
