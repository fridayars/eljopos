'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('regencies', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            code: {
                type: Sequelize.STRING(10),
                allowNull: false,
                unique: true
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            province_code: {
                type: Sequelize.STRING(10),
                allowNull: false,
                references: {
                    model: 'provinces',
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

        await queryInterface.addIndex('regencies', ['code']);
        await queryInterface.addIndex('regencies', ['province_code']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('regencies');
    }
};
