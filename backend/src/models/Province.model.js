'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Province extends Model {
        static associate(models) {
            Province.hasMany(models.Regency, {
                foreignKey: 'province_code',
                sourceKey: 'code',
                as: 'regencies'
            });
        }
    }
    Province.init({
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
        created_at: DataTypes.DATE,
        updated_at: DataTypes.DATE
    }, {
        sequelize,
        modelName: 'Province',
        tableName: 'provinces',
        underscored: true,
        paranoid: false
    });
    return Province;
};
