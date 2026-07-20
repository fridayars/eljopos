'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Buat tabel kategori_arus_uang
    await queryInterface.createTable('kategori_arus_uang', {
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
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
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

    // 2. Drop any stale FK constraint on category_id (from old kategori_pengeluaran migration)
    await queryInterface.sequelize.query(
      `ALTER TABLE "arus_uang" DROP CONSTRAINT IF EXISTS "arus_uang_category_id_fkey"`
    );

    // 3. Tambahkan kolom category_id ke tabel arus_uang (skip if already exists)
    const [columns] = await queryInterface.sequelize.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'arus_uang' AND column_name = 'category_id'`
    );
    if (columns.length === 0) {
      await queryInterface.addColumn('arus_uang', 'category_id', {
        type: Sequelize.UUID,
        allowNull: true,
      });
    }

    // 4. Add correct FK constraint pointing to kategori_arus_uang
    await queryInterface.sequelize.query(
      `ALTER TABLE "arus_uang"
       ADD CONSTRAINT "arus_uang_category_id_fkey"
       FOREIGN KEY ("category_id") REFERENCES "kategori_arus_uang" ("id")
       ON UPDATE CASCADE ON DELETE SET NULL`
    );

    // 5. Clean up stale SequelizeMeta entry for old migration (if exists)
    await queryInterface.sequelize.query(
      `DELETE FROM "SequelizeMeta" WHERE "name" = '20260720100000-create-kategori-pengeluaran.js'`
    );
  },

  async down(queryInterface, Sequelize) {
    // 1. Hapus kolom category_id dari arus_uang
    await queryInterface.removeColumn('arus_uang', 'category_id');

    // 2. Hapus tabel kategori_arus_uang
    await queryInterface.dropTable('kategori_arus_uang');
  }
};
