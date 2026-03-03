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
        notes: DataTypes.TEXT,
        is_active: DataTypes.BOOLEAN,
        created_at: DataTypes.DATE,
        updated_at: DataTypes.DATE,
        deleted_at: DataTypes.DATE
    }, {
        sequelize,
        modelName: 'Store',
        tableName: 'stores',
        underscored: true,
        paranoid: true
    });
    return Store;
};
