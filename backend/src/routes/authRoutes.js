const express = require('express')
const router = express.Router()

const authController = require('../controllers/authController')
const { loginValidation } = require('../validations/authValidation')
const validate = require('../middlewares/validate')
const authMiddleware = require('../middlewares/authMiddleware')

// POST /api/auth/login
router.post('/login', loginValidation, validate, authController.login)

// POST /api/auth/logout
router.post('/logout', authMiddleware, authController.logout)

module.exports = router
