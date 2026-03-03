'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Layanan extends Model {
        static associate(models) {
            Layanan.belongsTo(models.Store, {
                foreignKey: 'store_id',
                as: 'store'
            });
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
        store_id: DataTypes.UUID,
        kategori_layanan_id: DataTypes.UUID,
        name: DataTypes.STRING,
        price: DataTypes.DECIMAL(15, 2),
        cost_price: DataTypes.DECIMAL(15, 2),
        biaya_overhead: DataTypes.INTEGER,
        description: DataTypes.TEXT,
        is_active: DataTypes.BOOLEAN,
        created_at: DataTypes.DATE,
        updated_at: DataTypes.DATE,
        deleted_at: DataTypes.DATE
    }, {
        sequelize,
        modelName: 'Layanan',
        tableName: 'layanan',
        underscored: true,
        paranoid: true
    });
    return Layanan;
};
