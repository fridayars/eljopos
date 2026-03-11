const { Op } = require('sequelize');
const db = require('../models');
const AppError = require('../utils/app.error');
const logger = require('../utils/logger.util');

const { Role, AksesRole, User } = db;

/**
 * Get all active roles (for dropdowns)
 */
const getAllRoles = async () => {
    try {
        const roles = await Role.findAll({
            where: { is_active: true },
            attributes: ['id', 'name'],
            order: [['name', 'ASC']]
        });
        return roles;
    } catch (error) {
        logger.error({
            type: 'get_all_roles_failed',
            message: error.message,
            stack: error.stack
        });
        throw new AppError('Gagal mengambil data role: ' + error.message, 500);
    }
};

/**
 * Get paginated roles
 */
const getRolesPaginated = async (page = 1, limit = 10, search = '', sortBy = 'created_at', sortOrder = 'DESC') => {
    try {
        const offset = (page - 1) * limit;
        const whereClause = {};

        if (search) {
            whereClause.name = {
                [Op.iLike]: `%${search}%`
            };
        }

        const { count, rows } = await Role.findAndCountAll({
            where: whereClause,
            order: [[sortBy, sortOrder]],
            limit: parseInt(limit),
            offset: parseInt(offset),
            distinct: true,
            include: [{
                model: AksesRole,
                as: 'permissions',
                attributes: ['permission']
            }]
        });

        return {
            total_items: count,
            total_pages: Math.ceil(count / limit),
            current_page: parseInt(page),
            limit: parseInt(limit),
            items: rows
        };
    } catch (error) {
        logger.error({
            type: 'get_roles_paginated_failed',
            message: error.message,
            stack: error.stack
        });
        throw new AppError('Gagal mengambil data role: ' + error.message, 500);
    }
};

/**
 * Get role by ID with permissions
 */
const getRoleById = async (id) => {
    try {
        const role = await Role.findByPk(id, {
            include: [{
                model: AksesRole,
                as: 'permissions',
                attributes: ['permission']
            }]
        });

        if (!role) {
            throw new AppError('Role tidak ditemukan', 404);
        }

        return role;
    } catch (error) {
        logger.error({ type: 'get_role_by_id_failed', message: error.message, stack: error.stack });
        if (error instanceof AppError) throw error;
        throw new AppError('Gagal mengambil data role: ' + error.message, 500);
    }
};

/**
 * Create role with permissions
 */
const createRole = async (data) => {
    const transaction = await db.sequelize.transaction();
    try {
        const { name, is_active, permissions } = data;

        const existingRole = await Role.findOne({ where: { name: { [Op.iLike]: name } } });
        if (existingRole) {
            throw new AppError('Nama role sudah digunakan', 400);
        }

        const role = await Role.create({
            name,
            is_active: is_active !== undefined ? is_active : true
        }, { transaction });

        if (permissions && Array.isArray(permissions) && permissions.length > 0) {
            const aksesRoleData = permissions.map(permission => ({
                role_id: role.id,
                permission
            }));
            await AksesRole.bulkCreate(aksesRoleData, { transaction });
        }

        await transaction.commit();
        return role;
    } catch (error) {
        await transaction.rollback();
        logger.error({ type: 'create_role_failed', message: error.message, stack: error.stack });
        if (error instanceof AppError) throw error;
        throw new AppError('Gagal membuat role: ' + error.message, 500);
    }
};

/**
 * Update role and permissions
 */
const updateRole = async (id, data) => {
    const transaction = await db.sequelize.transaction();
    try {
        const { name, permissions } = data;

        const role = await Role.findByPk(id);
        if (!role) {
            throw new AppError('Role tidak ditemukan', 404);
        }

        if (name && name !== role.name) {
            const existingRole = await Role.findOne({ 
                where: { 
                    name: { [Op.iLike]: name },
                    id: { [Op.ne]: id }
                } 
            });
            if (existingRole) {
                throw new AppError('Nama role sudah digunakan', 400);
            }
            role.name = name;
            await role.save({ transaction });
        }

        if (permissions && Array.isArray(permissions)) {
            // Delete existing permissions
            await AksesRole.destroy({ where: { role_id: id }, transaction, force: true });
            
            // Insert new permissions if any
            if (permissions.length > 0) {
                const aksesRoleData = permissions.map(permission => ({
                    role_id: role.id,
                    permission
                }));
                await AksesRole.bulkCreate(aksesRoleData, { transaction });
            }
        }

        await transaction.commit();
        return role;
    } catch (error) {
        await transaction.rollback();
        logger.error({ type: 'update_role_failed', message: error.message, stack: error.stack });
        if (error instanceof AppError) throw error;
        throw new AppError('Gagal memperbarui role: ' + error.message, 500);
    }
};

/**
 * Toggle role status
 */
const toggleRoleStatus = async (id) => {
    try {
        const role = await Role.findByPk(id);
        if (!role) {
            throw new AppError('Role tidak ditemukan', 404);
        }

        role.is_active = !role.is_active;
        await role.save();

        return role;
    } catch (error) {
        logger.error({ type: 'toggle_role_status_failed', message: error.message, stack: error.stack });
        if (error instanceof AppError) throw error;
        throw new AppError('Gagal mengubah status role: ' + error.message, 500);
    }
};

/**
 * Soft delete role
 */
const deleteRole = async (id) => {
    try {
        const role = await Role.findByPk(id);
        if (!role) {
            throw new AppError('Role tidak ditemukan', 404);
        }

        // Check if role is used by users
        const usersCount = await User.count({ where: { role_id: id } });
        if (usersCount > 0) {
            throw new AppError(`Role tidak bisa dihapus karena masih digunakan oleh ${usersCount} user`, 400);
        }

        await role.destroy();
        return { message: 'Role berhasil dihapus' };
    } catch (error) {
        logger.error({ type: 'delete_role_failed', message: error.message, stack: error.stack });
        if (error instanceof AppError) throw error;
        throw new AppError('Gagal menghapus role: ' + error.message, 500);
    }
};

module.exports = {
    getAllRoles,
    getRolesPaginated,
    getRoleById,
    createRole,
    updateRole,
    toggleRoleStatus,
    deleteRole
};
