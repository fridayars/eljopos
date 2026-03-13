'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class StockOpnameDetail extends Model {
        static associate(models) {
            StockOpnameDetail.belongsTo(models.StockOpname, {
                foreignKey: 'stock_opname_id',
                as: 'stockOpname'
            });
            StockOpnameDetail.belongsTo(models.Product, {
                foreignKey: 'product_id',
                as: 'product'
            });
        }
    }
    StockOpnameDetail.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        stock_opname_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        product_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        stok_sistem: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        stok_fisik: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        selisih: {
            type: DataTypes.INTEGER,
            allowNull: false
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
        modelName: 'StockOpnameDetail',
        tableName: 'stock_opname_details',
        underscored: true,
        paranoid: true
    });
    return StockOpnameDetail;
};
