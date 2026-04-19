const { body } = require('express-validator');

const createArusUangValidation = [
    body('type')
        .notEmpty().withMessage('Type cannot be empty')
        .isIn(['IN', 'OUT']).withMessage('Type must be IN or OUT'),
    
    // We force the source to be MANUAL when using this endpoint
    // It's validated internally or overriden inside the controller, but good to check if they send it
    body('source')
        .optional()
        .isIn(['MANUAL']).withMessage('Manual creation only allows MANUAL source'),

    body('payment_method')
        .notEmpty().withMessage('Payment method cannot be empty')
        .isIn(['CASH', 'TRANSFER_BCA']).withMessage('Invalid payment method'),

    body('amount')
        .notEmpty().withMessage('Amount cannot be empty')
        .isNumeric().withMessage('Amount must be highly numeric')
        .custom(value => value > 0).withMessage('Amount must be greater than 0'),

    body('description')
        .optional()
        .isString().withMessage('Description must be a string'),

    body('date')
        .notEmpty().withMessage('Date cannot be empty')
        .isISO8601().toDate().withMessage('Invalid date format')
];

module.exports = {
    createArusUangValidation
};
