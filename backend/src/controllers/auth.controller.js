const authService = require('../services/auth.service')

/**
 * Login — POST /api/auth/login
 */
const login = async (req, res, next) => {
    try {
        const ip = req.ip
        const userAgent = req.get('User-Agent')

        const data = await authService.login(req.body, ip, userAgent)

        return res.json({
            success: true,
            data
        })
    } catch (error) {
        next(error)
    }
}

/**
 * Logout — POST /api/auth/logout
 */
const logout = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]
        const data = await authService.logout(req.user.user_id, token)

        return res.json({
            success: true,
            data
        })
    } catch (error) {
        next(error)
    }
}

/**
 * Switch Store — POST /api/auth/switch-store
 */
const switchStore = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]
        const { store_id } = req.body
        const ip = req.ip
        const userAgent = req.get('User-Agent')

        if (!store_id) {
            return res.status(400).json({ success: false, message: 'store_id is required' })
        }

        const data = await authService.switchStore(req.user.user_id, store_id, token, { ip, userAgent })

        return res.json({
            success: true,
            data
        })
    } catch (error) {
        next(error)
    }
}

module.exports = { login, logout, switchStore }
