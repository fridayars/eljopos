const db = require('../models');
const { TipeHp } = db;
const { Op } = require('sequelize');
const AppError = require('../utils/app.error');

const getAllTipeHp = async ({ search }) => {
    try {
        const whereClause = {};
        if (search) {
            whereClause.name = { [Op.iLike]: `%${search}%` };
        }

        const tipeHps = await TipeHp.findAll({
            where: whereClause,
            order: [['name', 'ASC']]
        });

        return tipeHps;
    } catch (error) {
        throw new AppError('Failed to get tipe HP', 500);
    }
};

const createTipeHp = async (data) => {
    try {
        if (!data.name) {
            throw new AppError('Tipe HP name is required', 400);
        }

        const existing = await TipeHp.findOne({ where: { name: { [Op.iLike]: data.name } } });
        if (existing) {
            return existing; // return existing if already exists
        }

        const tipeHp = await TipeHp.create({ name: data.name });
        return tipeHp;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to create tipe HP', 500);
    }
};

module.exports = { getAllTipeHp, createTipeHp };
