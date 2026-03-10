const { body } = require('express-validator');

const createUserValidation = [
    body('username').notEmpty().withMessage('Username diperlukan').trim(),
    body('email').isEmail().withMessage('Email valid diperlukan').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
    body('role_id').notEmpty().withMessage('Role diperlukan').isUUID().withMessage('Format Role ID tidak valid')
];

const updateUserValidation = [
    body('username').optional().notEmpty().withMessage('Username tidak boleh kosong').trim(),
    body('email').optional().isEmail().withMessage('Email valid diperlukan').normalizeEmail(),
    body('password').optional().isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
    body('role_id').optional().isUUID().withMessage('Format Role ID tidak valid')
];

module.exports = {
    createUserValidation,
    updateUserValidation
};
