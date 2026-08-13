'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Staff extends Model {
        static associate(_models) {
            // No associations needed for now
        }
    }
    Staff.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
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
