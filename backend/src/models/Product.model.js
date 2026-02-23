'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Product extends Model {
        static associate(models) {
            Product.belongsTo(models.Store, {
                foreignKey: 'store_id',
                as: 'store'
            });
            Product.belongsTo(models.KategoriProduk, {
                foreignKey: 'kategori_produk_id',
                as: 'kategori'
            });
            Product.hasMany(models.ProdukLayanan, {
                foreignKey: 'product_id',
                as: 'produkLayanan'
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
        store_id: DataTypes.UUID,
        kategori_produk_id: DataTypes.UUID,
        name: DataTypes.STRING,
        sku: DataTypes.STRING, // Removed unique: true
        stock: DataTypes.INTEGER,
        price: DataTypes.DECIMAL(15, 2),
        cost_price: DataTypes.DECIMAL(15, 2),
        jasa_pasang: DataTypes.INTEGER,
        ongkir_asuransi: DataTypes.INTEGER,
        biaya_overhead: DataTypes.INTEGER,
        image_url: DataTypes.STRING,
        is_active: DataTypes.BOOLEAN
    }, {
        sequelize,
        modelName: 'Product',
        tableName: 'products',
        underscored: true,
        paranoid: true, // Enables soft delete (deleted_at)
        indexes: [
            {
                unique: true,
                fields: ['sku', 'store_id'],
                where: {
                    deleted_at: null
                }
            }
        ]
    });
    return Product;
};
