const supplierService = require('../services/supplier.service');

const getAllSuppliers = async (req, res, next) => {
    try {
        const search = req.query.search;
        const result = await supplierService.getAllSuppliers({ search });
        return res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

const createSupplier = async (req, res, next) => {
    try {
        const result = await supplierService.createSupplier(req.body);
        return res.status(201).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

module.exports = { getAllSuppliers, createSupplier };
