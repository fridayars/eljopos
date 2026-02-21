'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Layanan extends Model {
        static associate(models) {
            Layanan.belongsTo(models.KategoriLayanan, {
                foreignKey: 'kategori_layanan_id',
                as: 'kategori'
            });
            Layanan.hasMany(models.ProdukLayanan, {
                foreignKey: 'layanan_id',
                as: 'produkLayanan'
            });
        }
    }
    Layanan.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        kategori_layanan_id: DataTypes.UUID,
        name: DataTypes.STRING,
        price: DataTypes.DECIMAL(15, 2),
        description: DataTypes.TEXT,
        is_active: DataTypes.BOOLEAN
    }, {
        sequelize,
        modelName: 'Layanan',
        tableName: 'layanan',
        underscored: true
    });
    return Layanan;
};
