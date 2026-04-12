const wilayahService = require('../services/wilayah.service');

/**
 * Get All Provinces — GET /wilayah/provinces
 */
const getProvinces = async (req, res, next) => {
    try {
        const data = await wilayahService.getAllProvinces();
        return res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

/**
 * Get Regencies by Province — GET /wilayah/regencies?province_code=xx
 */
const getRegencies = async (req, res, next) => {
    try {
        const { province_code } = req.query;
        const data = await wilayahService.getRegenciesByProvince(province_code);
        return res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

/**
 * Get Districts by Regency — GET /wilayah/districts?regency_code=xx.xx
 */
const getDistricts = async (req, res, next) => {
    try {
        const { regency_code } = req.query;
        const data = await wilayahService.getDistrictsByRegency(regency_code);
        return res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

module.exports = { getProvinces, getRegencies, getDistricts };
