const jwt = require('jsonwebtoken')
const AppError = require('../utils/app.error')
const db = require('../models')

const { User, LogSession } = db

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]

        if (!token) {
            throw new AppError('Unauthorized1: Token not provided', 401)
        }

        // Verify token — jika invalid/malformed → Unauthorized1
        let decoded
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET)
        } catch (jwtError) {
            throw new AppError('Unauthorized1: Invalid token', 401)
        }

        // Cek user exists dan aktif — jika tidak ditemukan → Unauthorized2
        const user = await User.findByPk(decoded.user_id)
        if (!user || !user.is_active) {
            throw new AppError('Unauthorized2: User not found or inactive', 401)
        }

        // Cek session masih berlaku — jika expired/tidak ada → Unauthorized3
        const session = await LogSession.findOne({
            where: {
                user_id: decoded.user_id,
                token: token
            }
        })

        if (!session) {
            throw new AppError('Unauthorized3: Session not found', 401)
        }

        if (session.expires_at && new Date(session.expires_at) < new Date()) {
            throw new AppError('Unauthorized4: Session expired', 401)
        }

        req.user = decoded
        next()
    } catch (error) {
        if (error instanceof AppError) {
            return next(error)
        }

        return next(new AppError('Unauthorized1: Invalid token', 401))
    }
}

module.exports = authMiddleware
