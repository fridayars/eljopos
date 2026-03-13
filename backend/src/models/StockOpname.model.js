'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class StockOpname extends Model {
        static associate(models) {
            StockOpname.belongsTo(models.Store, {
                foreignKey: 'store_id',
                as: 'store'
            });
            StockOpname.belongsTo(models.User, {
                foreignKey: 'user_id',
                as: 'user'
            });
            StockOpname.hasMany(models.StockOpnameDetail, {
                foreignKey: 'stock_opname_id',
                as: 'details'
            });
        }
    }
    StockOpname.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        opname_number: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        store_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        tanggal: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        status: {
            type: DataTypes.ENUM('DRAFT', 'COMPLETED', 'CANCELLED'),
            allowNull: false,
            defaultValue: 'DRAFT'
        },
        keterangan: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        created_at: DataTypes.DATE,
        updated_at: DataTypes.DATE,
        deleted_at: DataTypes.DATE
    }, {
        sequelize,
        modelName: 'StockOpname',
        tableName: 'stock_opnames',
        underscored: true,
        paranoid: true
    });
    return StockOpname;
};
