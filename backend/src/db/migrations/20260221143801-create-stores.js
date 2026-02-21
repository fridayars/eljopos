'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('stores', {
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
            address: {
                type: Sequelize.TEXT
            },
            phone: {
                type: Sequelize.STRING(50)
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

        await queryInterface.addIndex('stores', ['name']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('stores');
    }
};
