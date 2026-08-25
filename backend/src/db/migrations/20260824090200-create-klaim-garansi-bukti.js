'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('klaim_garansi_bukti', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
                allowNull: false,
            },
            klaim_garansi_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'klaim_garansi',
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

        await queryInterface.addIndex('klaim_garansi_bukti', ['klaim_garansi_id']);
    },

    async down(queryInterface) {
        await queryInterface.dropTable('klaim_garansi_bukti');
    },
};
