'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Stok extends Model {
        static associate(models) {
            Stok.belongsTo(models.Product, {
                foreignKey: 'product_id',
                as: 'product'
            });
            Stok.belongsTo(models.Store, {
                foreignKey: 'store_id',
                as: 'store'
            });
        }
    }
    Stok.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        product_id: DataTypes.UUID,
        store_id: DataTypes.UUID,
        quantity: DataTypes.INTEGER
    }, {
        sequelize,
        modelName: 'Stok',
        tableName: 'stok',
        underscored: true,
        createdAt: false // Schema focuses strictly on updated_at
    });
    return Stok;
};
