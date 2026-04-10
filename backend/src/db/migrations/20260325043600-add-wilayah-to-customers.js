'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('customers', 'province_code', {
            type: Sequelize.STRING(10),
            allowNull: true,
            after: 'address'
        });
        await queryInterface.addColumn('customers', 'province_name', {
            type: Sequelize.STRING,
            allowNull: true,
            after: 'province_code'
        });
        await queryInterface.addColumn('customers', 'regency_code', {
            type: Sequelize.STRING(10),
            allowNull: true,
            after: 'province_name'
        });
        await queryInterface.addColumn('customers', 'regency_name', {
            type: Sequelize.STRING,
            allowNull: true,
            after: 'regency_code'
        });
        await queryInterface.addColumn('customers', 'district_code', {
            type: Sequelize.STRING(15),
            allowNull: true,
            after: 'regency_name'
        });
        await queryInterface.addColumn('customers', 'district_name', {
            type: Sequelize.STRING,
            allowNull: true,
            after: 'district_code'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('customers', 'province_code');
        await queryInterface.removeColumn('customers', 'province_name');
        await queryInterface.removeColumn('customers', 'regency_code');
        await queryInterface.removeColumn('customers', 'regency_name');
        await queryInterface.removeColumn('customers', 'district_code');
        await queryInterface.removeColumn('customers', 'district_name');
    }
};
