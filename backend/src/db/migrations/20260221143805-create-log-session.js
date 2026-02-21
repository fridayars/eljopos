'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('log_session', {
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
                onDelete: 'CASCADE'
            },
            token: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            device: {
                type: Sequelize.STRING(255)
            },
            ip_address: {
                type: Sequelize.STRING(45)
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            expires_at: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });

        await queryInterface.addIndex('log_session', ['user_id']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('log_session');
    }
};
