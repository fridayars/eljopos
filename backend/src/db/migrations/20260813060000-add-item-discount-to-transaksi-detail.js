'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('transaksi_detail', 'discount_type', {
            type: Sequelize.STRING(10),
            allowNull: true,
            defaultValue: null
        });
        await queryInterface.addColumn('transaksi_detail', 'discount_value', {
            type: Sequelize.DECIMAL(15, 2),
            allowNull: true,
            defaultValue: 0
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('transaksi_detail', 'discount_value');
        await queryInterface.removeColumn('transaksi_detail', 'discount_type');
    }
};
