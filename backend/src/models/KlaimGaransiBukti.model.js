'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class KlaimGaransiBukti extends Model {
        static associate(models) {
            KlaimGaransiBukti.belongsTo(models.KlaimGaransi, {
                foreignKey: 'klaim_garansi_id',
                as: 'klaimGaransi'
            });
        }
    }
    KlaimGaransiBukti.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        klaim_garansi_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        image_url: {
            type: DataTypes.STRING,
            allowNull: false
        },
        image_key: {
            type: DataTypes.STRING,
            allowNull: false
        },
        created_at: DataTypes.DATE,
        updated_at: DataTypes.DATE,
        deleted_at: DataTypes.DATE
    }, {
        sequelize,
        modelName: 'KlaimGaransiBukti',
        tableName: 'klaim_garansi_bukti',
        underscored: true,
        paranoid: true
    });
    return KlaimGaransiBukti;
};
