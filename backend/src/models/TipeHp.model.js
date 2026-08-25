'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class TipeHp extends Model {
        static associate(models) {
            TipeHp.hasMany(models.KlaimGaransi, {
                foreignKey: 'tipe_hp_id',
                as: 'klaimGaransi'
            });
        }
    }
    TipeHp.init({
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
        modelName: 'TipeHp',
        tableName: 'tipe_hp',
        underscored: true,
        paranoid: true
    });
    return TipeHp;
};
