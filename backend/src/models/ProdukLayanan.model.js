'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class ProdukLayanan extends Model {
        static associate(models) {
            ProdukLayanan.belongsTo(models.Layanan, {
                foreignKey: 'layanan_id',
                as: 'layanan'
            });
            ProdukLayanan.belongsTo(models.Product, {
                foreignKey: 'product_id',
                as: 'product'
            });
        }
    }
    ProdukLayanan.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        layanan_id: DataTypes.UUID,
        product_id: DataTypes.UUID,
        quantity: DataTypes.INTEGER
    }, {
        sequelize,
        modelName: 'ProdukLayanan',
        tableName: 'produk_layanan',
        underscored: true,
        timestamps: false // No created_at/updated_at in this schema
    });
    return ProdukLayanan;
};
