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
router.use('/auth', require('./auth.route'))
router.use('/master/products', require('./product.route'))
router.use('/master/stores', require('./store.route'))
router.use('/master/layanan', require('./layanan.route'))
router.use('/master/customers', require('./customer.route'))
router.use('/transaksi', require('./transaksi.route'))
router.use('/laporan', require('./laporan.route'))
router.use('/dashboard', require('./dashboard.route'))
router.use('/upload', require('./upload.route'))

module.exports = router
