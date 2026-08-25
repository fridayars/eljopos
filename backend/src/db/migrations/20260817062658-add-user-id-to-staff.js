'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('staff', 'user_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('staff', 'user_id');
  }
};
