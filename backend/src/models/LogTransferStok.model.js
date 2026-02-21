'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class LogTransferStok extends Model {
        static associate(models) {
            LogTransferStok.belongsTo(models.Product, {
                foreignKey: 'product_id',
                as: 'product'
            });
            LogTransferStok.belongsTo(models.Store, {
                foreignKey: 'from_store_id',
                as: 'fromStore'
            });
            LogTransferStok.belongsTo(models.Store, {
                foreignKey: 'to_store_id',
                as: 'toStore'
            });
            LogTransferStok.belongsTo(models.User, {
                foreignKey: 'user_id',
                as: 'user'
            });
        }
    }
    LogTransferStok.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        product_id: DataTypes.UUID,
        from_store_id: DataTypes.UUID,
        to_store_id: DataTypes.UUID,
        quantity: DataTypes.INTEGER,
        user_id: DataTypes.UUID
    }, {
        sequelize,
        modelName: 'LogTransferStok',
        tableName: 'log_transfer_stok',
        underscored: true,
        updatedAt: false // Only tracks creation timestamp for logs
    });
    return LogTransferStok;
};
