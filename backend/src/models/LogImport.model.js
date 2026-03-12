'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class LogImport extends Model {
        static associate(models) {
            LogImport.belongsTo(models.User, {
                foreignKey: 'user_id',
                as: 'user'
            });
            LogImport.belongsTo(models.Store, {
                foreignKey: 'store_id',
                as: 'store'
            });
        }
    }
    LogImport.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        store_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        file_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        total_inserted: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        total_updated: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        total_deleted: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        total_skipped: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        errors: {
            type: DataTypes.JSONB,
            allowNull: true
        },
        created_at: DataTypes.DATE,
        updated_at: DataTypes.DATE
    }, {
        sequelize,
        modelName: 'LogImport',
        tableName: 'log_import',
        underscored: true,
        paranoid: false
    });
    return LogImport;
};
