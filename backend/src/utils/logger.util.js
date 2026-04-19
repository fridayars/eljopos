const util = require('util');
const fs = require('fs');
const path = require('path');

// ─── Log File Configuration ───
const LOG_DIR = path.join(process.cwd(), 'logs');
const LOG_FILE = path.join(LOG_DIR, 'app.log');
const ERROR_LOG_FILE = path.join(LOG_DIR, 'error.log');
const MAX_LOG_SIZE = 5 * 1024 * 1024; // 5MB max per file

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Simple terminal-friendly logger formatter
const formatPayload = (payload) => {
    const ts = new Date().toISOString();
    if (payload instanceof Error) {
        return `${ts} - ${payload.name}: ${payload.message}\n${payload.stack}`;
    }

    // If it's an object, pretty-print with 2-space indent
    if (typeof payload === 'object') {
        try {
            return `${ts} - ${util.inspect(payload, { depth: null, colors: false, compact: false })}`;
        } catch (e) {
            return `${ts} - ${String(payload)}`;
        }
    }

    return `${ts} - ${String(payload)}`;
};

/**
 * Append log entry to file safely (non-blocking).
 * Rotates log file if it exceeds MAX_LOG_SIZE.
 */
const appendToFile = (filePath, entry) => {
    try {
        // Rotate if file too large
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            if (stats.size >= MAX_LOG_SIZE) {
                const rotatedPath = filePath + '.old';
                // Remove old rotated file if exists
                if (fs.existsSync(rotatedPath)) {
                    fs.unlinkSync(rotatedPath);
                }
                fs.renameSync(filePath, rotatedPath);
            }
        }

        fs.appendFileSync(filePath, entry + '\n', 'utf8');
    } catch (e) {
        // Silent fail — don't break the app because of logging
        console.error('[LOGGER] Failed to write log file:', e.message);
    }
};

const logger = {
    error: (payload) => {
        const formatted = '\n[ERROR] ' + formatPayload(payload) + '\n';
        console.error(formatted);
        appendToFile(LOG_FILE, formatted.trim());
        appendToFile(ERROR_LOG_FILE, formatted.trim());
    },
    warn: (payload) => {
        const formatted = '\n[WARN]  ' + formatPayload(payload) + '\n';
        console.warn(formatted);
        appendToFile(LOG_FILE, formatted.trim());
    },
    info: (payload) => {
        const formatted = '\n[INFO]  ' + formatPayload(payload) + '\n';
        console.info(formatted);
        appendToFile(LOG_FILE, formatted.trim());
    },
    debug: (payload) => {
        const formatted = '\n[DEBUG] ' + formatPayload(payload) + '\n';
        console.debug(formatted);
        appendToFile(LOG_FILE, formatted.trim());
    },

    // ─── File Access Methods (for API) ───

    /**
     * Get log file path
     */
    getLogDir: () => LOG_DIR,
    getLogFile: () => LOG_FILE,
    getErrorLogFile: () => ERROR_LOG_FILE,

    /**
     * Read log file content. Returns last N lines.
     * @param {'app'|'error'} type - which log file
     * @param {number} lines - number of lines from the end (default 200)
     * @returns {{ content: string, totalLines: number, fileSize: number }}
     */
    readLogs: (type = 'app', lines = 200) => {
        const filePath = type === 'error' ? ERROR_LOG_FILE : LOG_FILE;

        if (!fs.existsSync(filePath)) {
            return { content: '', totalLines: 0, fileSize: 0 };
        }

        const stats = fs.statSync(filePath);
        const content = fs.readFileSync(filePath, 'utf8');
        const allLines = content.split('\n');
        const totalLines = allLines.length;

        // Return last N lines
        const sliced = allLines.slice(-lines).join('\n');

        return {
            content: sliced,
            totalLines,
            fileSize: stats.size,
            fileSizeHuman: (stats.size / 1024).toFixed(2) + ' KB'
        };
    },

    /**
     * Clear log file
     * @param {'app'|'error'|'all'} type
     */
    clearLogs: (type = 'all') => {
        const results = [];

        if (type === 'app' || type === 'all') {
            if (fs.existsSync(LOG_FILE)) {
                fs.writeFileSync(LOG_FILE, '', 'utf8');
                results.push('app.log cleared');
            }
            // Also remove rotated file
            const rotatedApp = LOG_FILE + '.old';
            if (fs.existsSync(rotatedApp)) {
                fs.unlinkSync(rotatedApp);
                results.push('app.log.old removed');
            }
        }

        if (type === 'error' || type === 'all') {
            if (fs.existsSync(ERROR_LOG_FILE)) {
                fs.writeFileSync(ERROR_LOG_FILE, '', 'utf8');
                results.push('error.log cleared');
            }
            const rotatedErr = ERROR_LOG_FILE + '.old';
            if (fs.existsSync(rotatedErr)) {
                fs.unlinkSync(rotatedErr);
                results.push('error.log.old removed');
            }
        }

        return results;
    }
};

module.exports = logger;
