const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createUserValidation, updateUserValidation } = require('../validations/user.validation');

// Apply auth middleware
router.use(authMiddleware);

// Routes
router.get('/', userController.getUsers);
router.post('/', createUserValidation, validate, userController.createUser);
router.put('/:id', updateUserValidation, validate, userController.updateUser);
router.patch('/:id/toggle-status', userController.toggleUserStatus);
router.delete('/:id', userController.deleteUser);

module.exports = router;
