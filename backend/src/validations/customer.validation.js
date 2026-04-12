const { body } = require('express-validator')

const createCustomerValidation = [
    body('name')
        .notEmpty()
        .withMessage('Name is required')
        .isString()
        .withMessage('Name must be a string')
        .trim(),

    body('phone')
        .notEmpty()
        .withMessage('Phone is required')
        .isString()
        .withMessage('Phone must be a string')
        .trim(),

    body('email')
        .optional({ checkFalsy: true })
        .isEmail()
        .withMessage('Email must be a valid email')
        .trim(),

    body('address')
        .optional({ checkFalsy: true })
        .isString()
        .withMessage('Address must be a string')
        .trim(),

    body('province_code').optional({ checkFalsy: true }).isString().trim(),
    body('province_name').optional({ checkFalsy: true }).isString().trim(),
    body('regency_code').optional({ checkFalsy: true }).isString().trim(),
    body('regency_name').optional({ checkFalsy: true }).isString().trim(),
    body('district_code').optional({ checkFalsy: true }).isString().trim(),
    body('district_name').optional({ checkFalsy: true }).isString().trim()
]

const updateCustomerValidation = [
    body('name')
        .optional()
        .isString()
        .withMessage('Name must be a string')
        .trim(),

    body('phone')
        .optional()
        .isString()
        .withMessage('Phone must be a string')
        .trim(),

    body('email')
        .optional({ checkFalsy: true })
        .isEmail()
        .withMessage('Email must be a valid email')
        .trim(),

    body('address')
        .optional({ checkFalsy: true })
        .isString()
        .withMessage('Address must be a string')
        .trim(),

    body('province_code').optional({ checkFalsy: true }).isString().trim(),
    body('province_name').optional({ checkFalsy: true }).isString().trim(),
    body('regency_code').optional({ checkFalsy: true }).isString().trim(),
    body('regency_name').optional({ checkFalsy: true }).isString().trim(),
    body('district_code').optional({ checkFalsy: true }).isString().trim(),
    body('district_name').optional({ checkFalsy: true }).isString().trim()
]

module.exports = { createCustomerValidation, updateCustomerValidation }
