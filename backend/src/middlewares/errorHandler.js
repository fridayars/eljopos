const logger = require('../utils/logger')

const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500

    logger.error({
        message: err.message,
        stack: err.stack,
        path: req.originalUrl,
        method: req.method
    })

    return res.status(statusCode).json({
        success: false,
        message: statusCode === 500 ? 'Internal Server Error' : err.message
    })
}

module.exports = errorHandler
