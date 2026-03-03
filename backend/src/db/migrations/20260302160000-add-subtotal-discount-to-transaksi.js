'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('transaksi', 'subtotal', {
            type: Sequelize.DECIMAL(15, 2),
            allowNull: true,
            defaultValue: 0
        });

        await queryInterface.addColumn('transaksi', 'discount_type', {
            type: Sequelize.ENUM('percentage', 'amount'),
            allowNull: true,
            defaultValue: null
        });

        await queryInterface.addColumn('transaksi', 'discount', {
            type: Sequelize.DECIMAL(15, 2),
            allowNull: true,
            defaultValue: 0
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('transaksi', 'subtotal');
        await queryInterface.removeColumn('transaksi', 'discount_type');
        await queryInterface.removeColumn('transaksi', 'discount');

        // Drop the ENUM type created by Sequelize
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_transaksi_discount_type";');
    }
};
