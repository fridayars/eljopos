'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('klaim_garansi', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
                allowNull: false,
            },
            transaksi_detail_id: {
                type: Sequelize.UUID,
                allowNull: false,
                unique: true, // satu klaim per item layanan
                references: {
                    model: 'transaksi_detail',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            tanggal_klaim: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            user_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            tindakan: {
                type: Sequelize.STRING,
                allowNull: false,
                comment: 'ganti_sparepart | tanpa_ganti_sparepart',
            },
            kendala: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            supplier_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'supplier',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
            },
            merk: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
            },
            deleted_at: {
                type: Sequelize.DATE,
                allowNull: true,
            },
        });

        await queryInterface.addIndex('klaim_garansi', ['transaksi_detail_id'], { unique: true });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('klaim_garansi');
    },
};
