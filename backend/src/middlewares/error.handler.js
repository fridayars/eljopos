const logger = require('../utils/logger.util')

const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500

    logger.error({
        message: err.message,
        stack: err.stack,
        path: req.originalUrl,
        method: req.method
    })

    const response = {
        success: false,
        message: statusCode === 500 ? 'Internal Server Error' : err.message
    }

    // Include field-level validation errors if present
    if (err.errors) {
        response.errors = err.errors
    }

    return res.status(statusCode).json(response)
}

module.exports = errorHandler
