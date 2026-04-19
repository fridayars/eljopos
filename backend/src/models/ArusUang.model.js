'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class ArusUang extends Model {
        static associate(models) {
            ArusUang.belongsTo(models.Store, {
                foreignKey: 'store_id',
                as: 'store'
            });

            ArusUang.belongsTo(models.User, {
                foreignKey: 'created_by',
                as: 'creator'
            });
            // You can optionally associate this with Transaksi if reference_id points to Transaksi
            // ArusUang.belongsTo(models.Transaksi, {
            //     foreignKey: 'reference_id',
            //     as: 'transaksi',
            //     constraints: false
            // });
        }
    }
    ArusUang.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        store_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        type: {
            type: DataTypes.ENUM('IN', 'OUT'),
            allowNull: false
        },
        source: {
            type: DataTypes.ENUM('TRANSAKSI', 'PEMBELIAN', 'MANUAL'),
            allowNull: false
        },
        reference_id: {
            type: DataTypes.UUID,
            allowNull: true
        },
        payment_method: {
            // For split bills, each payment method will have its own record
            type: DataTypes.ENUM('CASH', 'TRANSFER_BCA'),
            allowNull: false
        },
        amount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        created_by: {
            type: DataTypes.UUID,
            allowNull: false
        },
        created_at: DataTypes.DATE,
        updated_at: DataTypes.DATE,
        deleted_at: DataTypes.DATE
    }, {
        sequelize,
        modelName: 'ArusUang',
        tableName: 'arus_uang',
        underscored: true,
        paranoid: true
    });
    return ArusUang;
};
