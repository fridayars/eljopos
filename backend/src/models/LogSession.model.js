'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class LogSession extends Model {
        static associate(models) {
            LogSession.belongsTo(models.User, {
                foreignKey: 'user_id',
                as: 'user'
            });
        }
    }
    LogSession.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        user_id: DataTypes.UUID,
        token: DataTypes.TEXT,
        device: DataTypes.STRING,
        ip_address: DataTypes.STRING,
        expires_at: DataTypes.DATE
    }, {
        sequelize,
        modelName: 'LogSession',
        tableName: 'log_session',
        underscored: true,
        updatedAt: false // Schema mostly focuses on creation and expiration
    });
    return LogSession;
};
