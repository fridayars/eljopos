'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const tableDescription = await queryInterface.describeTable('transaksi');
        if (tableDescription.transaction_date) {
            return;
        }

        await queryInterface.addColumn('transaksi', 'transaction_date', {
            type: Sequelize.DATE,
            allowNull: true,
            defaultValue: null
        });

        // Backfill: set transaction_date = created_at for existing records
        await queryInterface.sequelize.query(
            'UPDATE transaksi SET transaction_date = created_at WHERE transaction_date IS NULL'
        );
    },

    async down(queryInterface) {
        const tableDescription = await queryInterface.describeTable('transaksi');
        if (tableDescription.transaction_date) {
            await queryInterface.removeColumn('transaksi', 'transaction_date');
        }
    }
};
