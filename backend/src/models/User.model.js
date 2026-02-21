'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        static associate(models) {
            User.belongsTo(models.Store, {
                foreignKey: 'store_id',
                as: 'store'
            });
            User.belongsTo(models.Role, {
                foreignKey: 'role_id',
                as: 'role'
            });
            User.hasMany(models.LogSession, {
                foreignKey: 'user_id',
                as: 'sessions'
            });
        }
    }
    User.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        store_id: DataTypes.UUID,
        role_id: DataTypes.UUID,
        username: {
            type: DataTypes.STRING,
            unique: true
        },
        email: {
            type: DataTypes.STRING,
            unique: true
        },
        password: DataTypes.STRING,
        is_active: DataTypes.BOOLEAN
    }, {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        underscored: true,
        paranoid: true, // Soft delete enabled
    });
    return User;
};
