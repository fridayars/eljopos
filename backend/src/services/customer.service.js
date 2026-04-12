const db = require('../models');
const { Customer } = db;
const { Op } = require('sequelize');
const AppError = require('../utils/app.error');
const logger = require('../utils/logger.util');

/**
 * Get All Customers — dengan pagination dan search
 */
const getAllCustomers = async ({ page = 1, limit = 10, search }) => {
    try {
        const offset = (page - 1) * limit;

        const whereClause = {};
        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { phone: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const { count: total, rows: customers } = await Customer.findAndCountAll({
            where: whereClause,
            attributes: ['id', 'name', 'phone', 'email', 'address', 'is_active', 'created_at'],
            order: [['created_at', 'DESC']],
            limit,
            offset
        });

        const totalPages = Math.ceil(total / limit);

        return {
            items: customers,
            pagination: {
                page,
                limit,
                total,
                total_pages: totalPages,
                has_next: page < totalPages,
                has_prev: page > 1
            }
        };
    } catch (error) {
        logger.error({ type: 'get_customers_failed', message: error.message });
        throw new AppError('Failed to get customers', 500);
    }
};

/**
 * Create Customer
 */
const createCustomer = async (data) => {
    try {
        // Cek phone unik
        const existing = await Customer.findOne({
            where: { phone: data.phone }
        });

        if (existing) {
            throw new AppError('Phone number already registered', 400);
        }

        const customer = await Customer.create({
            name: data.name,
            phone: data.phone,
            email: data.email || null,
            address: data.address || null,
            province_code: data.province_code || null,
            province_name: data.province_name || null,
            regency_code: data.regency_code || null,
            regency_name: data.regency_name || null,
            district_code: data.district_code || null,
            district_name: data.district_name || null,
            is_active: true
        });

        logger.info({ type: 'customer_created', customer_id: customer.id });

        return {
            id: customer.id,
            name: customer.name
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        logger.error({ type: 'create_customer_failed', message: error.message });
        throw new AppError('Failed to create customer', 500);
    }
};

/**
 * Update Customer
 */
const updateCustomer = async (id, data) => {
    try {
        const customer = await Customer.findByPk(id);

        if (!customer) {
            throw new AppError('Customer not found', 404);
        }

        // Cek phone unik jika berubah
        if (data.phone && data.phone !== customer.phone) {
            const existing = await Customer.findOne({
                where: { phone: data.phone, id: { [Op.ne]: id } }
            });
            if (existing) {
                throw new AppError('Phone number already registered', 400);
            }
        }

        await customer.update({
            name: data.name !== undefined ? data.name : customer.name,
            phone: data.phone !== undefined ? data.phone : customer.phone,
            email: data.email !== undefined ? data.email : customer.email,
            address: data.address !== undefined ? data.address : customer.address,
            province_code: data.province_code !== undefined ? data.province_code : customer.province_code,
            province_name: data.province_name !== undefined ? data.province_name : customer.province_name,
            regency_code: data.regency_code !== undefined ? data.regency_code : customer.regency_code,
            regency_name: data.regency_name !== undefined ? data.regency_name : customer.regency_name,
            district_code: data.district_code !== undefined ? data.district_code : customer.district_code,
            district_name: data.district_name !== undefined ? data.district_name : customer.district_name
        });

        logger.info({ type: 'customer_updated', customer_id: id });

        return {
            id: customer.id,
            name: customer.name
        };
    } catch (error) {
        if (error instanceof AppError) throw error;
        logger.error({ type: 'update_customer_failed', message: error.message });
        throw new AppError('Failed to update customer', 500);
    }
};

/**
 * Delete Customer (Soft Delete)
 */
const deleteCustomer = async (id) => {
    try {
        const customer = await Customer.findByPk(id);

        if (!customer) {
            throw new AppError('Customer not found', 404);
        }

        await customer.destroy(); // paranoid soft delete

        logger.info({ type: 'customer_deleted', customer_id: id });

        return { message: 'Customer deleted successfully' };
    } catch (error) {
        if (error instanceof AppError) throw error;
        logger.error({ type: 'delete_customer_failed', message: error.message });
        throw new AppError('Failed to delete customer', 500);
    }
};

module.exports = { getAllCustomers, createCustomer, updateCustomer, deleteCustomer };
