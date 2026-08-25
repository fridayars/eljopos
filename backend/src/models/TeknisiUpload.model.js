'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class TeknisiUpload extends Model {
        static associate(models) {
            TeknisiUpload.belongsTo(models.TransaksiDetail, {
                foreignKey: 'transaksi_detail_id',
                as: 'transaksiDetail'
            });
            TeknisiUpload.belongsTo(models.User, {
                foreignKey: 'uploaded_by',
                as: 'uploader'
            });
        }
    }
    TeknisiUpload.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        transaksi_detail_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        image_url: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        image_key: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        uploaded_by: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        created_at: DataTypes.DATE,
        updated_at: DataTypes.DATE,
        deleted_at: DataTypes.DATE,
    }, {
        sequelize,
        modelName: 'TeknisiUpload',
        tableName: 'teknisi_upload',
        underscored: true,
        paranoid: true,
    });
    return TeknisiUpload;
};
