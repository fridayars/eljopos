'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Store extends Model {
        static associate(models) {
            Store.hasMany(models.Product, {
                foreignKey: 'store_id',
                as: 'products'
            });
            Store.hasMany(models.Layanan, {
                foreignKey: 'store_id',
                as: 'layanan'
            });
            Store.hasMany(models.Transaksi, {
                foreignKey: 'store_id',
                as: 'transaksi'
            });
        }
    }
    Store.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: DataTypes.STRING,
        address: DataTypes.TEXT,
        phone: DataTypes.STRING,
        is_active: DataTypes.BOOLEAN
    }, {
        sequelize,
        modelName: 'Store',
        tableName: 'stores',
        underscored: true,
        paranoid: true
    });
    return Store;
};
