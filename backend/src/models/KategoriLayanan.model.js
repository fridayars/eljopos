'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class KategoriLayanan extends Model {
        static associate(models) {
            KategoriLayanan.hasMany(models.Layanan, {
                foreignKey: 'kategori_layanan_id',
                as: 'layanan'
            });
        }
    }
    KategoriLayanan.init({
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
        modelName: 'KategoriLayanan',
        tableName: 'kategori_layanan',
        underscored: true,
        paranoid: true
    });
    return KategoriLayanan;
};
