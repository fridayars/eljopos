'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('layanan', 'insentif_teknisi', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
      after: 'biaya_overhead'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('layanan', 'insentif_teknisi');
  }
};
