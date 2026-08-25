'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class TransaksiDetail extends Model {
        static associate(models) {
            TransaksiDetail.belongsTo(models.Transaksi, {
                foreignKey: 'transaksi_id',
                as: 'transaksi'
            });
            TransaksiDetail.belongsTo(models.Staff, {
                foreignKey: 'staff_id',
                as: 'staff'
            });
            TransaksiDetail.hasMany(models.TeknisiUpload, {
                foreignKey: 'transaksi_detail_id',
                as: 'uploads'
            });
            TransaksiDetail.hasOne(models.KlaimGaransi, {
                foreignKey: 'transaksi_detail_id',
                as: 'klaimGaransi'
            });
        }
    }
    TransaksiDetail.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        transaksi_id: DataTypes.UUID,
        item_type: DataTypes.STRING,
        item_id: DataTypes.UUID,
        item_name: DataTypes.STRING,
        kategori_name: DataTypes.STRING,
        price: DataTypes.DECIMAL(15, 2),
        quantity: DataTypes.INTEGER,
        subtotal: DataTypes.DECIMAL(15, 2),
        discount_type: {
            type: DataTypes.STRING(10),
            allowNull: true,
            defaultValue: null
        },
        staff_id: {
            type: DataTypes.UUID,
            allowNull: true,
            defaultValue: null
        },
        batas_garansi: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null
        },
        discount_value: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true,
            defaultValue: 0
        },
        snapshot_insentif_teknisi: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true,
            defaultValue: null
        },
        snapshot_cost_price: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true,
            defaultValue: null
        },
        created_at: DataTypes.DATE,
        updated_at: DataTypes.DATE,
        deleted_at: DataTypes.DATE
    }, {
        sequelize,
        modelName: 'TransaksiDetail',
        tableName: 'transaksi_detail',
        underscored: true,
        paranoid: true
    });
    return TransaksiDetail;
};
