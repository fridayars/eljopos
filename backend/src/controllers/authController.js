const authService = require('../services/authService')

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

module.exports = { login, logout }
