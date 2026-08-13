'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class KategoriArusUang extends Model {
        static associate(models) {
            KategoriArusUang.belongsTo(models.Store, {
                foreignKey: 'store_id',
                as: 'store'
            });
            KategoriArusUang.hasMany(models.ArusUang, {
                foreignKey: 'category_id',
                as: 'arus_uangs'
            });
        }
    }
    KategoriArusUang.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        // tidak dipakai saat get data, data berlaku untuk semua cabang
        store_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        type: {
            type: DataTypes.ENUM('IN', 'OUT'),
            allowNull: false
        },
        name: DataTypes.STRING,
        description: DataTypes.TEXT,
        is_active: DataTypes.BOOLEAN,
        created_at: DataTypes.DATE,
        updated_at: DataTypes.DATE,
        deleted_at: DataTypes.DATE
    }, {
        sequelize,
        modelName: 'KategoriArusUang',
        tableName: 'kategori_arus_uang',
        underscored: true,
        paranoid: true
    });
    return KategoriArusUang;
};
