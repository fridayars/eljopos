'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Role extends Model {
        static associate(models) {
            Role.hasMany(models.AksesRole, {
                foreignKey: 'role_id',
                as: 'permissions'
            });
            Role.hasMany(models.User, {
                foreignKey: 'role_id',
                as: 'users'
            });
        }
    }
    Role.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            unique: true
        },
        is_active: DataTypes.BOOLEAN
    }, {
        sequelize,
        modelName: 'Role',
        tableName: 'roles',
        underscored: true
    });
    return Role;
};
