'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('users', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
            },
            store_id: {
                type: Sequelize.UUID,
                allowNull: true, // Might be null for superadmins
                references: {
                    model: 'stores',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            role_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'roles',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            username: {
                type: Sequelize.STRING(255),
                allowNull: false,
                unique: true
            },
            email: {
                type: Sequelize.STRING(255),
                allowNull: false,
                unique: true
            },
            password: {
                type: Sequelize.STRING(255),
                allowNull: false
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

        await queryInterface.addIndex('users', ['username']);
        await queryInterface.addIndex('users', ['email']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('users');
    }
};
