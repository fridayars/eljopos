'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class KlaimGaransi extends Model {
        static associate(models) {
            KlaimGaransi.belongsTo(models.TransaksiDetail, {
                foreignKey: 'transaksi_detail_id',
                as: 'transaksiDetail'
            });
            KlaimGaransi.belongsTo(models.User, {
                foreignKey: 'user_id',
                as: 'user'
            });
            KlaimGaransi.belongsTo(models.Supplier, {
                foreignKey: 'supplier_id',
                as: 'supplier'
            });
            KlaimGaransi.belongsTo(models.TipeHp, {
                foreignKey: 'tipe_hp_id',
                as: 'tipe_hp'
            });
            KlaimGaransi.hasMany(models.KlaimGaransiBukti, {
                foreignKey: 'klaim_garansi_id',
                as: 'bukti'
            });
        }
    }
    KlaimGaransi.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        transaksi_detail_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        tanggal_klaim: {
            type: DataTypes.DATE,
            allowNull: false
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        tindakan: {
            type: DataTypes.STRING,
            allowNull: false
        },
        kendala: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        supplier_id: {
            type: DataTypes.UUID,
            allowNull: true
        },
        tipe_hp_id: {
            type: DataTypes.UUID,
            allowNull: true
        },
        merk: {
            type: DataTypes.STRING,
            allowNull: true
        },
        detail_tindakan: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        created_at: DataTypes.DATE,
        updated_at: DataTypes.DATE,
        deleted_at: DataTypes.DATE
    }, {
        sequelize,
        modelName: 'KlaimGaransi',
        tableName: 'klaim_garansi',
        underscored: true,
        paranoid: true
    });
    return KlaimGaransi;
};
