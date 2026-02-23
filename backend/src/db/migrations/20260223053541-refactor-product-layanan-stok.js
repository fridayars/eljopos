'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // 1. Drop the 'stok' table
      await queryInterface.dropTable('stok', { transaction });

      // 2. Modify 'products' table
      // Remove old unique SKU constraint
      // Note: We use a try-catch for removing constraint in case the name differs in different environments,
      // but usually sequelize-cli names it 'products_sku_key' or 'sku'
      try {
        await queryInterface.removeConstraint('products', 'products_sku_key', { transaction });
      } catch (e) {
        console.log('Constraint products_sku_key not found, skipping removal.');
      }

      await queryInterface.addColumn('products', 'store_id', {
        type: Sequelize.UUID,
        references: {
          model: 'stores',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false
      }, { transaction });

      await queryInterface.addColumn('products', 'stock', {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      }, { transaction });

      await queryInterface.addColumn('products', 'jasa_pasang', {
        type: Sequelize.INTEGER,
        defaultValue: 0
      }, { transaction });

      await queryInterface.addColumn('products', 'ongkir_asuransi', {
        type: Sequelize.INTEGER,
        defaultValue: 0
      }, { transaction });

      await queryInterface.addColumn('products', 'biaya_overhead', {
        type: Sequelize.INTEGER,
        defaultValue: 0
      }, { transaction });

      // Add Partial Unique Index for SKU + StoreID where not deleted
      await queryInterface.addIndex('products', ['sku', 'store_id'], {
        unique: true,
        where: {
          deleted_at: null
        },
        transaction
      });

      // 3. Modify 'layanan' table
      await queryInterface.addColumn('layanan', 'store_id', {
        type: Sequelize.UUID,
        references: {
          model: 'stores',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false
      }, { transaction });

      await queryInterface.addColumn('layanan', 'cost_price', {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0
      }, { transaction });

      await queryInterface.addColumn('layanan', 'biaya_overhead', {
        type: Sequelize.INTEGER,
        defaultValue: 0
      }, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Revert 'layanan' changes
      await queryInterface.removeColumn('layanan', 'biaya_overhead', { transaction });
      await queryInterface.removeColumn('layanan', 'cost_price', { transaction });
      await queryInterface.removeColumn('layanan', 'store_id', { transaction });

      // Revert 'products' changes
      await queryInterface.removeIndex('products', ['sku', 'store_id'], { transaction });
      await queryInterface.removeColumn('products', 'biaya_overhead', { transaction });
      await queryInterface.removeColumn('products', 'ongkir_asuransi', { transaction });
      await queryInterface.removeColumn('products', 'jasa_pasang', { transaction });
      await queryInterface.removeColumn('products', 'stock', { transaction });
      await queryInterface.removeColumn('products', 'store_id', { transaction });

      // Re-add unique constraint to SKU
      await queryInterface.addConstraint('products', {
        fields: ['sku'],
        type: 'unique',
        name: 'products_sku_key',
        transaction
      });

      // Re-create 'stok' table
      await queryInterface.createTable('stok', {
        id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4
        },
        product_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'products',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
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
        quantity: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0
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
      }, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
