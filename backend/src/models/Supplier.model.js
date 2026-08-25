'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Supplier extends Model {
        static associate(models) {
            Supplier.hasMany(models.KlaimGaransi, {
                foreignKey: 'supplier_id',
                as: 'klaimGaransi'
            });
        }
    }
    Supplier.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        created_at: DataTypes.DATE,
        updated_at: DataTypes.DATE,
        deleted_at: DataTypes.DATE
    }, {
        sequelize,
        modelName: 'Supplier',
        tableName: 'supplier',
        underscored: true,
        paranoid: true
    });
    return Supplier;
};
