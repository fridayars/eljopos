'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('akses_role', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
            },
            role_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'roles',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            permission: {
                type: Sequelize.STRING(255),
                allowNull: false
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

        await queryInterface.addIndex('akses_role', ['role_id']);
        await queryInterface.addConstraint('akses_role', {
            fields: ['role_id', 'permission'],
            type: 'unique',
            name: 'unique_role_permission'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('akses_role');
    }
};
