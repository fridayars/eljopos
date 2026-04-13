'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('arus_uang', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      store_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'stores',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      type: {
        type: Sequelize.ENUM('IN', 'OUT'),
        allowNull: false
      },
      source: {
        type: Sequelize.ENUM('TRANSAKSI', 'PEMBELIAN', 'MANUAL'),
        allowNull: false
      },
      reference_id: {
        type: Sequelize.UUID,
        allowNull: true
      },
      payment_method: {
        type: Sequelize.ENUM('CASH', 'TRANSFER_BCA'),
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deleted_at: {
        type: Sequelize.DATE
      }
    });

    // Add indexes to optimize queries
    await queryInterface.addIndex('arus_uang', ['store_id']);
    await queryInterface.addIndex('arus_uang', ['date']);
    await queryInterface.addIndex('arus_uang', ['source', 'reference_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('arus_uang');
  }
};
