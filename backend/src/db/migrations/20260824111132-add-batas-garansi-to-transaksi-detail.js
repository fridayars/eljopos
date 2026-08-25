'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('transaksi_detail', 'batas_garansi', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('transaksi_detail', 'batas_garansi');
  }
};
