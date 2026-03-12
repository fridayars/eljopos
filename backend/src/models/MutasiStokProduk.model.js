'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class MutasiStokProduk extends Model {
        static associate(models) {
            MutasiStokProduk.belongsTo(models.Product, {
                foreignKey: 'product_id',
                as: 'product'
            });
        }
    }
    MutasiStokProduk.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        jenis_mutasi: {
            type: DataTypes.STRING,
            allowNull: false
        },
        product_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        reference_id: {
            type: DataTypes.UUID,
            allowNull: true
        },
        keterangan: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        stok: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        created_at: DataTypes.DATE,
        updated_at: DataTypes.DATE,
        deleted_at: DataTypes.DATE
    }, {
        sequelize,
        modelName: 'MutasiStokProduk',
        tableName: 'mutasi_stok_produk',
        underscored: true,
        paranoid: true
    });
    return MutasiStokProduk;
};
