const express = require('express')
const router = express.Router()

const authController = require('../controllers/auth.controller')
const { loginValidation } = require('../validations/auth.validation')
const validate = require('../middlewares/validate.middleware')
const authMiddleware = require('../middlewares/auth.middleware')

// POST /api/auth/login
router.post('/login', loginValidation, validate, authController.login)

// POST /api/auth/logout
router.post('/logout', authMiddleware, authController.logout)

// POST /api/auth/switch-store
router.post('/switch-store', authMiddleware, authController.switchStore)

module.exports = router
