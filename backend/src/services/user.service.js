const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const db = require('../models');
const AppError = require('../utils/app.error');
const logger = require('../utils/logger.util');

const { User, Role } = db;

/**
 * Get all users with pagination, search, and sorting
 */
const getUsers = async (query) => {
    try {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;
        const offset = (page - 1) * limit;

        const whereClause = {};

        if (query.search) {
            whereClause[Op.or] = [
                { username: { [Op.like]: `%${query.search}%` } },
                { email: { [Op.like]: `%${query.search}%` } }
            ];
        }

        const { count, rows } = await User.findAndCountAll({
            where: whereClause,
            include: [{
                model: Role,
                as: 'role',
                attributes: ['id', 'name']
            }],
            attributes: { exclude: ['password'] },
            limit,
            offset,
            order: [['created_at', 'DESC']]
        });

        return {
            total_items: count,
            total_pages: Math.ceil(count / limit),
            current_page: page,
            limit,
            items: rows
        };
    } catch (error) {
        logger.error({
            type: 'get_users_failed',
            message: error.message,
            stack: error.stack
        });
        throw new AppError('Gagal mengambil data user: ' + error.message, 500);
    }
};

/**
 * Create new user
 */
const createUser = async (payload) => {
    try {
        const { username, email, password, role_id } = payload;

        // Cek username unik
        const existingUsername = await User.findOne({ where: { username } });
        if (existingUsername) {
            throw new AppError('Username sudah digunakan', 400);
        }

        // Cek email unik
        const existingEmail = await User.findOne({ where: { email } });
        if (existingEmail) {
            throw new AppError('Email sudah digunakan', 400);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            role_id,
            is_active: true
        });

        const userResponse = newUser.toJSON();
        delete userResponse.password;

        logger.info({
            type: 'user_created',
            user_id: newUser.id,
            username: newUser.username
        });

        return userResponse;
    } catch (error) {
        logger.error({
            type: 'create_user_failed',
            message: error.message,
            stack: error.stack,
            payload: { ...payload, password: '***' }
        });
        if (error instanceof AppError) throw error;
        throw new AppError('Gagal membuat user: ' + error.message, 500);
    }
};

/**
 * Update user
 */
const updateUser = async (id, payload) => {
    try {
        const { username, email, password, role_id } = payload;
        
        const user = await User.findByPk(id);
        if (!user) {
            throw new AppError('User tidak ditemukan', 404);
        }

        if (username && username !== user.username) {
            const existingUsername = await User.findOne({ where: { username } });
            if (existingUsername) {
                throw new AppError('Username sudah digunakan', 400);
            }
            user.username = username;
        }

        if (email && email !== user.email) {
            const existingEmail = await User.findOne({ where: { email } });
            if (existingEmail) {
                throw new AppError('Email sudah digunakan', 400);
            }
            user.email = email;
        }

        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }

        if (role_id) {
            user.role_id = role_id;
        }

        await user.save();

        const updatedUser = await User.findByPk(id, {
            include: [{
                model: Role,
                as: 'role',
                attributes: ['id', 'name']
            }],
            attributes: { exclude: ['password'] }
        });

        logger.info({
            type: 'user_updated',
            target_user_id: user.id
        });

        return updatedUser;
    } catch (error) {
        logger.error({
            type: 'update_user_failed',
            target_user_id: id,
            message: error.message,
            stack: error.stack
        });
        if (error instanceof AppError) throw error;
        throw new AppError('Gagal memperbarui user: ' + error.message, 500);
    }
};

/**
 * Toggle user status (is_active)
 */
const toggleUserStatus = async (id) => {
    try {
        const user = await User.findByPk(id);
        if (!user) {
            throw new AppError('User tidak ditemukan', 404);
        }

        user.is_active = !user.is_active;
        await user.save();

        logger.info({
            type: 'user_status_toggled',
            target_user_id: user.id,
            is_active: user.is_active
        });

        return {
            id: user.id,
            is_active: user.is_active
        };
    } catch (error) {
        logger.error({
            type: 'toggle_user_status_failed',
            target_user_id: id,
            message: error.message,
            stack: error.stack
        });
        if (error instanceof AppError) throw error;
        throw new AppError('Gagal mengubah status user: ' + error.message, 500);
    }
};

/**
 * Delete user (soft delete)
 */
const deleteUser = async (id) => {
    try {
        const user = await User.findByPk(id);
        if (!user) {
            throw new AppError('User tidak ditemukan', 404);
        }

        await user.destroy(); // Soft delete because of paranoid: true

        logger.info({
            type: 'user_deleted',
            target_user_id: user.id
        });

        return { message: 'User berhasil dihapus' };
    } catch (error) {
        logger.error({
            type: 'delete_user_failed',
            target_user_id: id,
            message: error.message,
            stack: error.stack
        });
        if (error instanceof AppError) throw error;
        throw new AppError('Gagal menghapus user: ' + error.message, 500);
    }
};

module.exports = {
    getUsers,
    createUser,
    updateUser,
    toggleUserStatus,
    deleteUser
};
