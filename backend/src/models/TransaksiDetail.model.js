'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class TransaksiDetail extends Model {
        static associate(models) {
            TransaksiDetail.belongsTo(models.Transaksi, {
                foreignKey: 'transaksi_id',
                as: 'transaksi'
            });
        }
    }
    TransaksiDetail.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        transaksi_id: DataTypes.UUID,
        item_type: DataTypes.STRING,
        item_id: DataTypes.UUID,
        item_name: DataTypes.STRING,
        kategori_name: DataTypes.STRING,
        price: DataTypes.DECIMAL(15, 2),
        quantity: DataTypes.INTEGER,
        subtotal: DataTypes.DECIMAL(15, 2),
        created_at: DataTypes.DATE,
        updated_at: DataTypes.DATE,
        deleted_at: DataTypes.DATE
    }, {
        sequelize,
        modelName: 'TransaksiDetail',
        tableName: 'transaksi_detail',
        underscored: true,
        paranoid: true
    });
    return TransaksiDetail;
};
