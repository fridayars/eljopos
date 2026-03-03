'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const tableDescription = await queryInterface.describeTable('stores');
        if (!tableDescription.notes) {
            await queryInterface.addColumn('stores', 'notes', {
                type: Sequelize.TEXT,
                allowNull: true,
                defaultValue: null
            });
        }
    },

    async down(queryInterface, Sequelize) {
        const tableDescription = await queryInterface.describeTable('stores');
        if (tableDescription.notes) {
            await queryInterface.removeColumn('stores', 'notes');
        }
    }
};
