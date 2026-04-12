'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Regency extends Model {
        static associate(models) {
            Regency.belongsTo(models.Province, {
                foreignKey: 'province_code',
                targetKey: 'code',
                as: 'province'
            });
            Regency.hasMany(models.District, {
                foreignKey: 'regency_code',
                sourceKey: 'code',
                as: 'districts'
            });
        }
    }
    Regency.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        code: {
            type: DataTypes.STRING(10),
            allowNull: false,
            unique: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        province_code: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        created_at: DataTypes.DATE,
        updated_at: DataTypes.DATE
    }, {
        sequelize,
        modelName: 'Regency',
        tableName: 'regencies',
        underscored: true,
        paranoid: false
    });
    return Regency;
};
