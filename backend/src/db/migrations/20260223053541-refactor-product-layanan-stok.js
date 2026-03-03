'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // 1️⃣ Drop stok table (kalau ada)
      await queryInterface.dropTable('stok', { transaction }).catch(() => { });

      // 2️⃣ Pastikan minimal ada 1 store
      const [stores] = await queryInterface.sequelize.query(
        `SELECT id FROM stores LIMIT 1`,
        { transaction }
      );

      if (!stores.length) {
        throw new Error('No store found. Please seed at least one store before running this migration.');
      }

      const defaultStoreId = stores[0].id;

      // 3️⃣ Remove old SKU unique constraint (ignore if not exist)
      try {
        await queryInterface.removeConstraint('products', 'products_sku_key', { transaction });
      } catch (e) { }

      // 4️⃣ Tambah store_id sebagai nullable dulu
      await queryInterface.addColumn('products', 'store_id', {
        type: Sequelize.UUID,
        allowNull: true
      }, { transaction });

      // 5️⃣ Isi semua data lama dengan default store
      await queryInterface.sequelize.query(
        `UPDATE products SET store_id = :storeId`,
        {
          replacements: { storeId: defaultStoreId },
          transaction
        }
      );

      // 6️⃣ Ubah jadi NOT NULL + FK
      await queryInterface.changeColumn('products', 'store_id', {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'stores',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      }, { transaction });

      // 7️⃣ Tambah kolom lain
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

      // 8️⃣ Partial unique index
      await queryInterface.addIndex('products', ['sku', 'store_id'], {
        unique: true,
        where: { deleted_at: null },
        transaction
      });

      // 9️⃣ Layanan table
      await queryInterface.addColumn('layanan', 'store_id', {
        type: Sequelize.UUID,
        allowNull: true
      }, { transaction });

      await queryInterface.sequelize.query(
        `UPDATE layanan SET store_id = :storeId`,
        {
          replacements: { storeId: defaultStoreId },
          transaction
        }
      );

      await queryInterface.changeColumn('layanan', 'store_id', {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'stores',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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

      await queryInterface.removeColumn('layanan', 'biaya_overhead', { transaction });
      await queryInterface.removeColumn('layanan', 'cost_price', { transaction });
      await queryInterface.removeColumn('layanan', 'store_id', { transaction });

      await queryInterface.removeIndex('products', ['sku', 'store_id'], { transaction }).catch(() => { });
      await queryInterface.removeColumn('products', 'biaya_overhead', { transaction });
      await queryInterface.removeColumn('products', 'ongkir_asuransi', { transaction });
      await queryInterface.removeColumn('products', 'jasa_pasang', { transaction });
      await queryInterface.removeColumn('products', 'stock', { transaction });
      await queryInterface.removeColumn('products', 'store_id', { transaction });

      await queryInterface.addConstraint('products', {
        fields: ['sku'],
        type: 'unique',
        name: 'products_sku_key',
        transaction
      }).catch(() => { });

      await queryInterface.createTable('stok', {
        id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4
        },
        product_id: {
          type: Sequelize.UUID,
          allowNull: false
        },
        store_id: {
          type: Sequelize.UUID,
          allowNull: false
        },
        quantity: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        created_at: Sequelize.DATE,
        updated_at: Sequelize.DATE,
        deleted_at: Sequelize.DATE
      }, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};