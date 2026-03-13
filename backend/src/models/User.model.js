'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        static associate(models) {
            User.belongsTo(models.Role, {
                foreignKey: 'role_id',
                as: 'role'
            });
            User.hasMany(models.LogSession, {
                foreignKey: 'user_id',
                as: 'sessions'
            });
            User.hasMany(models.StockOpname, {
                foreignKey: 'user_id',
                as: 'stockOpnames'
            });
        }
    }
    User.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
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
        is_active: DataTypes.BOOLEAN,
        created_at: DataTypes.DATE,
        updated_at: DataTypes.DATE,
        deleted_at: DataTypes.DATE
    }, {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        underscored: true,
        paranoid: true, // Soft delete enabled
    });
    return User;
};
