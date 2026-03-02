require('dotenv').config()

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const compression = require('compression')

const routes = require('./routes')
const errorHandler = require('./middlewares/error.handler')
const logger = require('./utils/logger.util')
const sequelize = require('./models')

const app = express()
const PORT = process.env.PORT || 3000

// ─── Security Middleware ───
app.use(helmet())
app.use(cors())

// ─── Request Parsing ───
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ─── Logging ───
app.use(morgan('dev'))

// ─── Compression ───
app.use(compression())

// ─── API Routes ───
app.use('/api', routes)

// ─── 404 Handler ───
app.use((req, res) => {
    return res.status(404).json({
        success: false,
        message: 'Route not found'
    })
})

// ─── Global Error Handler (must be last) ───
app.use(errorHandler)

// ─── Start Server ───
const startServer = async () => {
    try {
        await sequelize.sequelize.authenticate()
        logger.info({ message: 'Database connected successfully' })

        await sequelize.sequelize.sync()
        logger.info({ message: 'Database synced' })

        app.listen(PORT, () => {
            logger.info({ message: `Server running on port ${PORT}` })
        })
    } catch (error) {
        logger.error({ message: 'Unable to start server', error: error.message })
        process.exit(1)
    }
}

startServer()
