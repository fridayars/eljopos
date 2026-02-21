'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Store extends Model {
        static associate(models) {
            Store.hasMany(models.User, {
                foreignKey: 'store_id',
                as: 'users'
            });
            Store.hasMany(models.Stok, {
                foreignKey: 'store_id',
                as: 'stok'
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
        underscored: true
    });
    return Store;
};
