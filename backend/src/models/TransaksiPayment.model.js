'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class TransaksiPayment extends Model {
        static associate(models) {
            TransaksiPayment.belongsTo(models.Transaksi, {
                foreignKey: 'transaksi_id',
                as: 'transaksi'
            });
        }
    }
    TransaksiPayment.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        transaksi_id: DataTypes.UUID,
        payment_method: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        nominal: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false
        },
        created_at: DataTypes.DATE,
        updated_at: DataTypes.DATE,
        deleted_at: DataTypes.DATE
    }, {
        sequelize,
        modelName: 'TransaksiPayment',
        tableName: 'transaksi_payments',
        underscored: true,
        paranoid: true
    });
    return TransaksiPayment;
};
