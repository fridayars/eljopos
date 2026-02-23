'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.removeColumn('users', 'store_id');
    },

    async down(queryInterface, Sequelize) {
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
};
