'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('districts', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            code: {
                type: Sequelize.STRING(15),
                allowNull: false,
                unique: true
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            regency_code: {
                type: Sequelize.STRING(10),
                allowNull: false,
                references: {
                    model: 'regencies',
                    key: 'code'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
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

        await queryInterface.addIndex('districts', ['code']);
        await queryInterface.addIndex('districts', ['regency_code']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('districts');
    }
};
