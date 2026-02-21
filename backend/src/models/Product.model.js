'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Product extends Model {
        static associate(models) {
            Product.belongsTo(models.KategoriProduk, {
                foreignKey: 'kategori_produk_id',
                as: 'kategori'
            });
            Product.hasMany(models.ProdukLayanan, {
                foreignKey: 'product_id',
                as: 'produkLayanan'
            });
            Product.hasMany(models.Stok, {
                foreignKey: 'product_id',
                as: 'stok'
            });
            Product.hasMany(models.LogTransferStok, {
                foreignKey: 'product_id',
                as: 'logTransfer'
            });
        }
    }
    Product.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        kategori_produk_id: DataTypes.UUID,
        name: DataTypes.STRING,
        sku: {
            type: DataTypes.STRING,
            unique: true
        },
        price: DataTypes.DECIMAL(15, 2),
        cost_price: DataTypes.DECIMAL(15, 2),
        image_url: DataTypes.STRING,
        is_active: DataTypes.BOOLEAN
    }, {
        sequelize,
        modelName: 'Product',
        tableName: 'products',
        underscored: true,
        paranoid: true, // Enables soft delete (deleted_at)
    });
    return Product;
};
