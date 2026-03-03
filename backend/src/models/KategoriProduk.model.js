'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class KategoriProduk extends Model {
        static associate(models) {
            KategoriProduk.hasMany(models.Product, {
                foreignKey: 'kategori_produk_id',
                as: 'products'
            });
        }
    }
    KategoriProduk.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: DataTypes.STRING,
        description: DataTypes.TEXT,
        is_active: DataTypes.BOOLEAN,
        created_at: DataTypes.DATE,
        updated_at: DataTypes.DATE,
        deleted_at: DataTypes.DATE
    }, {
        sequelize,
        modelName: 'KategoriProduk',
        tableName: 'kategori_produk',
        underscored: true,
        paranoid: true
    });
    return KategoriProduk;
};
