const db = require('../models');
const { Supplier } = db;
const { Op } = require('sequelize');
const AppError = require('../utils/app.error');

const getAllSuppliers = async ({ search }) => {
    try {
        const whereClause = {};
        if (search) {
            whereClause.name = { [Op.iLike]: `%${search}%` };
        }

        const suppliers = await Supplier.findAll({
            where: whereClause,
            order: [['name', 'ASC']]
        });

        return suppliers;
    } catch (error) {
        throw new AppError('Failed to get suppliers', 500);
    }
};

const createSupplier = async (data) => {
    try {
        if (!data.name) {
            throw new AppError('Supplier name is required', 400);
        }

        const existing = await Supplier.findOne({ where: { name: { [Op.iLike]: data.name } } });
        if (existing) {
            return existing; // return existing if already exists
        }

        const supplier = await Supplier.create({ name: data.name });
        return supplier;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError('Failed to create supplier', 500);
    }
};

module.exports = { getAllSuppliers, createSupplier };
