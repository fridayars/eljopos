const customerService = require('../services/customer.service');

/**
 * Get All Customers — GET /api/master/customers
 */
const getAllCustomers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const search = req.query.search;

        const result = await customerService.getAllCustomers({ page, limit, search });

        return res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

/**
 * Create Customer — POST /api/master/customers
 */
const createCustomer = async (req, res, next) => {
    try {
        const result = await customerService.createCustomer(req.body);

        return res.status(201).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

/**
 * Update Customer — PUT /api/master/customers/:id
 */
const updateCustomer = async (req, res, next) => {
    try {
        const result = await customerService.updateCustomer(req.params.id, req.body);

        return res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete Customer — DELETE /api/master/customers/:id
 */
const deleteCustomer = async (req, res, next) => {
    try {
        const result = await customerService.deleteCustomer(req.params.id);

        return res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

module.exports = { getAllCustomers, createCustomer, updateCustomer, deleteCustomer };
