'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('teknisi_upload', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
                allowNull: false,
            },
            transaksi_detail_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'transaksi_detail',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            image_url: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            image_key: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            uploaded_by: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
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

        // Index for faster lookups by transaksi_detail_id
        await queryInterface.addIndex('teknisi_upload', ['transaksi_detail_id']);
    },

    async down(queryInterface) {
        await queryInterface.dropTable('teknisi_upload');
    },
};
