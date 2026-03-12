'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('log_import', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
            },
            user_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            store_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'stores',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            file_name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            total_inserted: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            total_updated: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            total_deleted: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            total_skipped: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            errors: {
                type: Sequelize.JSONB,
                allowNull: true
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

        await queryInterface.addIndex('log_import', ['user_id']);
        await queryInterface.addIndex('log_import', ['store_id']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('log_import');
    }
};
