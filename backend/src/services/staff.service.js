const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const db = require('../models');
const AppError = require('../utils/app.error');
const logger = require('../utils/logger.util');

const Staff = db.Staff;
const User = db.User;
const Role = db.Role;

/**
 * Get all active staff (dropdown)
 */
const getAllActiveStaff = async () => {
    const staff = await Staff.findAll({
        where: { is_active: true },
        attributes: ['id', 'name'],
        order: [['name', 'ASC']],
    });
    return staff.map(s => ({ id: s.id, name: s.name }));
};

/**
 * Get staff list with pagination and search
 */
const getStaff = async (query) => {
    try {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;
        const offset = (page - 1) * limit;

        const whereClause = {};

        if (query.search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${query.search}%` } },
            ];
        }

        const { count, rows } = await Staff.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [['created_at', 'DESC']],
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'username', 'email', 'role_id'],
                include: [{
                    model: Role,
                    as: 'role',
                    attributes: ['id', 'name']
                }]
            }]
        });

        return {
            total_items: count,
            total_pages: Math.ceil(count / limit),
            current_page: page,
            limit,
            items: rows,
        };
    } catch (error) {
        logger.error({ type: 'get_staff_failed', message: error.message, stack: error.stack });
        throw new AppError('Gagal mengambil data staff: ' + error.message, 500);
    }
};

/**
 * Create new staff
 */
const createStaff = async (payload) => {
    const t = await db.sequelize.transaction();
    try {
        const { name, username, email, password, role_id } = payload;

        const existing = await Staff.findOne({ where: { name }, transaction: t });
        if (existing) {
            throw new AppError('Nama staff sudah digunakan', 400);
        }

        let newUserId = null;
        if (username && email && password && role_id) {
            const existingUsername = await User.findOne({ where: { username }, transaction: t });
            if (existingUsername) throw new AppError('Username sudah digunakan', 400);

            const existingEmail = await User.findOne({ where: { email }, transaction: t });
            if (existingEmail) throw new AppError('Email sudah digunakan', 400);

            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = await User.create({
                username,
                email,
                password: hashedPassword,
                role_id,
                is_active: true
            }, { transaction: t });
            newUserId = newUser.id;
        } else if (username || email || password || role_id) {
            throw new AppError('Harap lengkapi semua data user (username, email, password, role) atau kosongkan semua jika tidak ingin membuat user', 400);
        }

        const newStaff = await Staff.create({ name, user_id: newUserId, is_active: true }, { transaction: t });

        await t.commit();
        logger.info({ type: 'staff_created', staff_id: newStaff.id, name: newStaff.name });

        return newStaff;
    } catch (error) {
        await t.rollback();
        logger.error({ type: 'create_staff_failed', message: error.message, stack: error.stack, payload });
        if (error instanceof AppError) throw error;
        throw new AppError('Gagal membuat staff: ' + error.message, 500);
    }
};

/**
 * Update staff
 */
const updateStaff = async (id, payload) => {
    const t = await db.sequelize.transaction();
    try {
        const { name, username, email, password, role_id } = payload;

        const staff = await Staff.findByPk(id, { transaction: t });
        if (!staff) throw new AppError('Staff tidak ditemukan', 404);

        if (name && name !== staff.name) {
            const existing = await Staff.findOne({ where: { name }, transaction: t });
            if (existing) throw new AppError('Nama staff sudah digunakan', 400);
            staff.name = name;
        }

        if (username || email || role_id || password) {
            if (staff.user_id) {
                // Update existing user
                const user = await User.findByPk(staff.user_id, { transaction: t });
                if (user) {
                    if (username && username !== user.username) {
                        const existingUser = await User.findOne({ where: { username }, transaction: t });
                        if (existingUser) throw new AppError('Username sudah digunakan', 400);
                        user.username = username;
                    }
                    if (email && email !== user.email) {
                        const existingEmail = await User.findOne({ where: { email }, transaction: t });
                        if (existingEmail) throw new AppError('Email sudah digunakan', 400);
                        user.email = email;
                    }
                    if (password) {
                        user.password = await bcrypt.hash(password, 10);
                    }
                    if (role_id) {
                        user.role_id = role_id;
                    }
                    await user.save({ transaction: t });
                }
            } else {
                // Create new user for existing staff
                if (!username || !email || !password || !role_id) {
                    throw new AppError('Harap lengkapi semua data user (username, email, password, role) untuk mendaftarkan user baru', 400);
                }
                const existingUser = await User.findOne({ where: { username }, transaction: t });
                if (existingUser) throw new AppError('Username sudah digunakan', 400);

                const existingEmail = await User.findOne({ where: { email }, transaction: t });
                if (existingEmail) throw new AppError('Email sudah digunakan', 400);

                const hashedPassword = await bcrypt.hash(password, 10);
                const newUser = await User.create({
                    username,
                    email,
                    password: hashedPassword,
                    role_id,
                    is_active: staff.is_active
                }, { transaction: t });

                staff.user_id = newUser.id;
            }
        }

        await staff.save({ transaction: t });
        await t.commit();

        logger.info({ type: 'staff_updated', target_staff_id: staff.id });

        return staff;
    } catch (error) {
        await t.rollback();
        logger.error({ type: 'update_staff_failed', target_staff_id: id, message: error.message, stack: error.stack });
        if (error instanceof AppError) throw error;
        throw new AppError('Gagal memperbarui staff: ' + error.message, 500);
    }
};

/**
 * Toggle staff status (is_active)
 */
const toggleStaffStatus = async (id) => {
    try {
        const staff = await Staff.findByPk(id);
        if (!staff) throw new AppError('Staff tidak ditemukan', 404);

        staff.is_active = !staff.is_active;
        await staff.save();

        logger.info({ type: 'staff_status_toggled', target_staff_id: staff.id, is_active: staff.is_active });

        return { id: staff.id, is_active: staff.is_active };
    } catch (error) {
        logger.error({ type: 'toggle_staff_status_failed', target_staff_id: id, message: error.message, stack: error.stack });
        if (error instanceof AppError) throw error;
        throw new AppError('Gagal mengubah status staff: ' + error.message, 500);
    }
};

/**
 * Delete staff (soft delete)
 */
const deleteStaff = async (id) => {
    try {
        const staff = await Staff.findByPk(id);
        if (!staff) throw new AppError('Staff tidak ditemukan', 404);

        await staff.destroy();

        logger.info({ type: 'staff_deleted', target_staff_id: staff.id });

        return { message: 'Staff berhasil dihapus' };
    } catch (error) {
        logger.error({ type: 'delete_staff_failed', target_staff_id: id, message: error.message, stack: error.stack });
        if (error instanceof AppError) throw error;
        throw new AppError('Gagal menghapus staff: ' + error.message, 500);
    }
};

module.exports = {
    getAllActiveStaff,
    getStaff,
    createStaff,
    updateStaff,
    toggleStaffStatus,
    deleteStaff,
};
