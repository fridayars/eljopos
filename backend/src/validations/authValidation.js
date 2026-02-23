const { body } = require('express-validator')

const loginValidation = [
    body('username')
        .notEmpty()
        .withMessage('Username is required')
        .isString()
        .withMessage('Username must be a string')
        .trim(),

    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isString()
        .withMessage('Password must be a string'),

    body('store_id')
        .notEmpty()
        .withMessage('Store ID is required')
        .isUUID()
        .withMessage('Store ID must be a valid UUID')
]

module.exports = { loginValidation }
