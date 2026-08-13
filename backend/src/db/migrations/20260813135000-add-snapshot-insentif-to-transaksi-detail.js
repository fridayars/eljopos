'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('transaksi_detail', 'snapshot_insentif_teknisi', {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: null
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('transaksi_detail', 'snapshot_insentif_teknisi');
  }
};
