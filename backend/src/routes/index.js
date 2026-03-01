const express = require('express')
const router = express.Router()

// Health check route
router.get('/health', (req, res) => {
    return res.json({
        success: true,
        data: {
            status: 'OK',
            timestamp: new Date().toISOString()
        }
    })
})

// Register routes here
router.use('/auth', require('./authRoutes'))
router.use('/master/products', require('./productRoutes'))

module.exports = router
