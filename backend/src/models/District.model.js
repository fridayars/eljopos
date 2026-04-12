'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class District extends Model {
        static associate(models) {
            District.belongsTo(models.Regency, {
                foreignKey: 'regency_code',
                targetKey: 'code',
                as: 'regency'
            });
        }
    }
    District.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        code: {
            type: DataTypes.STRING(15),
            allowNull: false,
            unique: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        regency_code: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        created_at: DataTypes.DATE,
        updated_at: DataTypes.DATE
    }, {
        sequelize,
        modelName: 'District',
        tableName: 'districts',
        underscored: true,
        paranoid: false
    });
    return District;
};
