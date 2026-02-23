'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class AksesRole extends Model {
        static associate(models) {
            AksesRole.belongsTo(models.Role, {
                foreignKey: 'role_id',
                as: 'role'
            });
        }
    }
    AksesRole.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        role_id: DataTypes.UUID,
        permission: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'AksesRole',
        tableName: 'akses_role',
        underscored: true,
        paranoid: true
    });
    return AksesRole;
};
