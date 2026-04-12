'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Customer extends Model {
        static associate(models) {
            Customer.hasMany(models.Transaksi, {
                foreignKey: 'customer_id',
                as: 'transaksi'
            });
        }
    }
    Customer.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: DataTypes.STRING,
        phone: {
            type: DataTypes.STRING,
            unique: true
        },
        email: DataTypes.STRING,
        address: DataTypes.TEXT,
        province_code: DataTypes.STRING(10),
        province_name: DataTypes.STRING,
        regency_code: DataTypes.STRING(10),
        regency_name: DataTypes.STRING,
        district_code: DataTypes.STRING(15),
        district_name: DataTypes.STRING,
        is_active: DataTypes.BOOLEAN,
        created_at: DataTypes.DATE,
        updated_at: DataTypes.DATE,
        deleted_at: DataTypes.DATE
    }, {
        sequelize,
        modelName: 'Customer',
        tableName: 'customers',
        underscored: true,
        paranoid: true
    });
    return Customer;
};
