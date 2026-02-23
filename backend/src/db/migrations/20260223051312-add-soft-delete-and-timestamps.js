'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const addColumnIfNotExists = async (tableName, columnName, definition) => {
        const tableDefinition = await queryInterface.describeTable(tableName);
        if (!tableDefinition[columnName]) {
          await queryInterface.addColumn(tableName, columnName, definition);
        }
      };

      const tablesNeededDeletedAt = [
        'kategori_produk', 'kategori_layanan', 'layanan', 'produk_layanan',
        'stores', 'roles', 'akses_role', 'log_session', 'customers',
        'log_transfer_stok', 'transaksi', 'stok', 'transaksi_detail'
      ];

      for (const table of tablesNeededDeletedAt) {
        await addColumnIfNotExists(table, 'deleted_at', {
          type: Sequelize.DATE,
          allowNull: true
        });
      }

      const tablesNeededTimestamps = [
        'produk_layanan', 'stok', 'transaksi_detail', 'log_session', 'log_transfer_stok'
      ];

      for (const table of tablesNeededTimestamps) {
        await addColumnIfNotExists(table, 'created_at', {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        });

        await addColumnIfNotExists(table, 'updated_at', {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        });
      }
    } catch (error) {
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      const removeColumnIfExists = async (tableName, columnName) => {
        const tableDefinition = await queryInterface.describeTable(tableName);
        if (tableDefinition[columnName]) {
          await queryInterface.removeColumn(tableName, columnName);
        }
      };

      const tablesWithDeletedAt = [
        'kategori_produk', 'kategori_layanan', 'layanan', 'produk_layanan',
        'stores', 'roles', 'akses_role', 'log_session', 'customers',
        'log_transfer_stok', 'transaksi', 'stok', 'transaksi_detail'
      ];

      for (const table of tablesWithDeletedAt) {
        await removeColumnIfExists(table, 'deleted_at');
      }

      const tablesWithTimestamps = [
        'produk_layanan', 'stok', 'transaksi_detail', 'log_session', 'log_transfer_stok'
      ];

      for (const table of tablesWithTimestamps) {
        await removeColumnIfExists(table, 'created_at');
        await removeColumnIfExists(table, 'updated_at');
      }
    } catch (error) {
      throw error;
    }
  }
};
