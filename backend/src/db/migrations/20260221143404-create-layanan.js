'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('layanan', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
            },
            kategori_layanan_id: {
                type: Sequelize.UUID,
                references: {
                    model: 'kategori_layanan',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            name: {
                type: Sequelize.STRING(255)
            },
            price: {
                type: Sequelize.DECIMAL(15, 2)
            },
            description: {
                type: Sequelize.TEXT
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
            }
        });

        await queryInterface.addIndex('layanan', ['kategori_layanan_id']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('layanan');
    }
};
