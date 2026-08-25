'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('klaim_garansi', 'detail_tindakan', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await queryInterface.addColumn('klaim_garansi', 'tipe_hp_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'tipe_hp',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('klaim_garansi', 'detail_tindakan');
    await queryInterface.removeColumn('klaim_garansi', 'tipe_hp_id');
  }
};
