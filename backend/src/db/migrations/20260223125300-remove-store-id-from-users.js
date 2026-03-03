'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        if (await queryInterface.checkColumnExists('users', 'store_id')) {
            await queryInterface.removeColumn('users', 'store_id');
        }
    },

    async down(queryInterface, Sequelize) {
        if (await queryInterface.checkColumnExists('users', 'store_id')) {
            await queryInterface.addColumn('users', 'store_id', {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'stores',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            });
        }
    }
};
