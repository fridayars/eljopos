const { validationResult } = require('express-validator')
const logger = require('../utils/logger.util')

const validate = (req, res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        logger.warn({
            type: 'validation_error',
            errors: errors.array()
        })

        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: errors.array()
        })
    }

    next()
}

module.exports = validate
