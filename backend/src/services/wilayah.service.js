'use strict';

const db = require('../models');
const { Province, Regency, District } = db;
const AppError = require('../utils/app.error');
const logger = require('../utils/logger.util');

/**
 * Get All Provinces
 */
const getAllProvinces = async () => {
    try {
        const provinces = await Province.findAll({
            attributes: ['code', 'name'],
            order: [['name', 'ASC']]
        });
        return provinces;
    } catch (error) {
        logger.error({ type: 'get_provinces_failed', message: error.message });
        throw new AppError('Failed to get provinces', 500);
    }
};

/**
 * Get Regencies by Province Code
 */
const getRegenciesByProvince = async (province_code) => {
    try {
        if (!province_code) throw new AppError('province_code is required', 400);

        const regencies = await Regency.findAll({
            where: { province_code },
            attributes: ['code', 'name'],
            order: [['name', 'ASC']]
        });
        return regencies;
    } catch (error) {
        if (error instanceof AppError) throw error;
        logger.error({ type: 'get_regencies_failed', message: error.message });
        throw new AppError('Failed to get regencies', 500);
    }
};

/**
 * Get Districts by Regency Code
 */
const getDistrictsByRegency = async (regency_code) => {
    try {
        if (!regency_code) throw new AppError('regency_code is required', 400);

        const districts = await District.findAll({
            where: { regency_code },
            attributes: ['code', 'name'],
            order: [['name', 'ASC']]
        });
        return districts;
    } catch (error) {
        if (error instanceof AppError) throw error;
        logger.error({ type: 'get_districts_failed', message: error.message });
        throw new AppError('Failed to get districts', 500);
    }
};

module.exports = { getAllProvinces, getRegenciesByProvince, getDistrictsByRegency };
