'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Staff extends Model {
        static associate(models) {
            Staff.belongsTo(models.User, {
                foreignKey: 'user_id',
                as: 'user'
            });
        }
    }
    Staff.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        name: DataTypes.STRING,
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        created_at: DataTypes.DATE,
        updated_at: DataTypes.DATE,
        deleted_at: DataTypes.DATE,
    }, {
        sequelize,
        modelName: 'Staff',
        tableName: 'staff',
        underscored: true,
        paranoid: true,
    });
    return Staff;
};
