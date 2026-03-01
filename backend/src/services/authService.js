const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { Op } = require('sequelize')
const db = require('../models')
const AppError = require('../utils/AppError')
const logger = require('../utils/logger')

const { User, Role, AksesRole, Store, LogSession } = db

/**
 * Login user — authenticate and generate JWT token
 */
const login = async (payload, ip, userAgent) => {
    try {
        const { username, password, store_id } = payload

        // 1. Cari user by username OR email, include Role -> AksesRole
        const user = await User.findOne({
            where: {
                [Op.or]: [
                    { username: username },
                    { email: username }
                ]
            },
            include: [
                {
                    model: Role,
                    as: 'role',
                    include: [
                        {
                            model: AksesRole,
                            as: 'permissions',
                            attributes: ['permission']
                        }
                    ]
                }
            ]
        })

        if (!user) {
            throw new AppError('Invalid username or password', 401)
        }

        // 2. Validasi user aktif
        if (!user.is_active) {
            throw new AppError('Account is deactivated', 401)
        }

        // 3. Validasi role aktif
        if (!user.role || !user.role.is_active) {
            throw new AppError('Role is not active', 401)
        }

        // 4. Bandingkan password
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            throw new AppError('Invalid username or password', 401)
        }

        // 5. Validasi store exists dan is_active
        const store = await Store.findByPk(store_id)
        if (!store) {
            throw new AppError('Store not found', 404)
        }
        if (!store.is_active) {
            throw new AppError('Store is not active', 400)
        }

        // 6. Ambil permissions
        const permissions = user.role.permissions.map(p => p.permission)

        // 7. Generate JWT token
        const tokenPayload = {
            user_id: user.id,
            username: user.username,
            role: user.role.name,
            store_id: store_id,
            permissions: permissions,
            can_access_all_stores: user.role.name.toLowerCase() === 'administrator'
        }

        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || '24h'
        })

        // 8. Hitung expires_at
        const decoded = jwt.decode(token)
        const expiresAt = new Date(decoded.exp * 1000)

        // 9. Simpan ke log_session
        await LogSession.create({
            user_id: user.id,
            token: token,
            device: userAgent || null,
            ip_address: ip || null,
            expires_at: expiresAt
        })

        logger.info({
            type: 'login_success',
            user_id: user.id,
            username: user.username,
            store_id: store_id,
            can_access_all_stores: user.role.name.toLowerCase() === 'administrator'
        })

        // 10. Siapkan response data
        const responseData = {
            token,
            user: {
                user_id: user.id,
                username: user.username,
                role: user.role.name,
                store_id: store_id,
                permissions,
                can_access_all_stores: user.role.name.toLowerCase() === 'administrator'
            }
        }

        // 11. Jika role Administrator, tambahkan available_stores
        if (user.role.name.toLowerCase() === 'administrator') {
            const stores = await Store.findAll({
                where: { is_active: true },
                attributes: ['id', 'name'],
                order: [['name', 'ASC']]
            })
            responseData.user.can_access_all_stores = true
            responseData.user.available_stores = stores
        }

        return responseData
    } catch (error) {
        logger.error({
            type: 'login_failed',
            message: error.message,
            stack: error.stack,
            payload: { ...payload, password: '***' }
        })

        if (error instanceof AppError) throw error
        throw new AppError('Login failed: ' + error.message, 500)
    }
}

/**
 * Logout user — soft delete log_session record
 */
const logout = async (userId, token) => {
    try {
        const session = await LogSession.findOne({
            where: {
                user_id: userId,
                token: token
            }
        })

        if (session) {
            await session.destroy() // Soft delete (paranoid: true)
        }

        logger.info({
            type: 'logout_success',
            user_id: userId
        })

        return { message: 'Logout successful' }
    } catch (error) {
        logger.error({
            type: 'logout_failed',
            user_id: userId,
            message: error.message,
            stack: error.stack
        })

        if (error instanceof AppError) throw error
        throw new AppError('Logout failed: ' + error.message, 500)
    }
}

module.exports = { login, logout }
