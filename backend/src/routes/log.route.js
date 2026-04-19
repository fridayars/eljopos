const express = require('express')
const router = express.Router()
const logger = require('../utils/logger.util')
const authMiddleware = require('../middlewares/auth.middleware')

/**
 * Middleware: Verify LOG_SECRET from query param or header
 * This adds an extra layer of security beyond auth token
 */
const verifyLogSecret = (req, res, next) => {
    const secret = req.query.secret || req.headers['x-log-secret']
    const LOG_SECRET = process.env.LOG_SECRET

    if (!LOG_SECRET) {
        return res.status(503).json({
            success: false,
            message: 'LOG_SECRET not configured on server. Add LOG_SECRET to your .env file.'
        })
    }

    if (secret !== LOG_SECRET) {
        return res.status(403).json({
            success: false,
            message: 'Invalid log secret'
        })
    }

    next()
}

/**
 * GET /api/logs
 * Query params:
 *   - type: 'app' | 'error' (default: 'app')
 *   - lines: number of lines from the end (default: 200)
 *   - secret: LOG_SECRET value
 */
router.get('/', verifyLogSecret, (req, res) => {
    try {
        const type = req.query.type || 'app'
        const lines = parseInt(req.query.lines) || 200

        if (!['app', 'error'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid type. Use "app" or "error".'
            })
        }

        const result = logger.readLogs(type, lines)

        return res.json({
            success: true,
            data: {
                type,
                requestedLines: lines,
                ...result
            }
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to read logs',
            error: error.message
        })
    }
})

/**
 * GET /api/logs/download
 * Download log file directly
 * Query params:
 *   - type: 'app' | 'error' (default: 'app')
 *   - secret: LOG_SECRET value
 */
router.get('/download', verifyLogSecret, (req, res) => {
    try {
        const type = req.query.type || 'app'
        const filePath = type === 'error' ? logger.getErrorLogFile() : logger.getLogFile()

        const fs = require('fs')
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: `Log file ${type}.log not found`
            })
        }

        const filename = type === 'error' ? 'error.log' : 'app.log'
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
        res.setHeader('Content-Type', 'text/plain')

        const stream = fs.createReadStream(filePath)
        stream.pipe(res)
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to download logs',
            error: error.message
        })
    }
})

/**
 * DELETE /api/logs
 * Clear log files
 * Query params:
 *   - type: 'app' | 'error' | 'all' (default: 'all')
 *   - secret: LOG_SECRET value
 */
router.get('/delete', verifyLogSecret, (req, res) => {
    try {
        const type = req.query.type || 'all'

        if (!['app', 'error', 'all'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid type. Use "app", "error", or "all".'
            })
        }

        const results = logger.clearLogs(type)

        logger.info({ message: `Logs cleared via API: ${type}` })

        return res.json({
            success: true,
            message: `Logs cleared successfully`,
            data: { cleared: results }
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to clear logs',
            error: error.message
        })
    }
})

/**
 * GET /api/logs/info
 * Get log files info (size, exists, etc)
 * Query params:
 *   - secret: LOG_SECRET value
 */
router.get('/info', verifyLogSecret, (req, res) => {
    try {
        const fs = require('fs')
        const logFile = logger.getLogFile()
        const errorLogFile = logger.getErrorLogFile()

        const getFileInfo = (filePath) => {
            if (!fs.existsSync(filePath)) {
                return { exists: false, size: 0, sizeHuman: '0 KB' }
            }
            const stats = fs.statSync(filePath)
            return {
                exists: true,
                size: stats.size,
                sizeHuman: (stats.size / 1024).toFixed(2) + ' KB',
                lastModified: stats.mtime.toISOString()
            }
        }

        return res.json({
            success: true,
            data: {
                logDir: logger.getLogDir(),
                appLog: getFileInfo(logFile),
                errorLog: getFileInfo(errorLogFile),
                appLogRotated: getFileInfo(logFile + '.old'),
                errorLogRotated: getFileInfo(errorLogFile + '.old')
            }
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to get log info',
            error: error.message
        })
    }
})

module.exports = router
