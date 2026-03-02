'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Transaksi extends Model {
        static associate(models) {
            Transaksi.belongsTo(models.Store, {
                foreignKey: 'store_id',
                as: 'store'
            });
            Transaksi.belongsTo(models.User, {
                foreignKey: 'user_id',
                as: 'user'
            });
            Transaksi.belongsTo(models.Customer, {
                foreignKey: 'customer_id',
                as: 'customer'
            });
            Transaksi.hasMany(models.TransaksiDetail, {
                foreignKey: 'transaksi_id',
                as: 'details'
            });
            Transaksi.hasMany(models.TransaksiPayment, {
                foreignKey: 'transaksi_id',
                as: 'payments'
            });
        }
    }
    Transaksi.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        store_id: DataTypes.UUID,
        user_id: DataTypes.UUID,
        customer_id: DataTypes.UUID,
        receipt_number: {
            type: DataTypes.STRING,
            unique: true
        },
        total_amount: DataTypes.DECIMAL(15, 2),
        payment_status: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'Transaksi',
        tableName: 'transaksi',
        underscored: true,
        paranoid: true
    });
    return Transaksi;
};
