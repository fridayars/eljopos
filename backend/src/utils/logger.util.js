const util = require('util');

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

const logger = {
    error: (payload) => console.error('\n[ERROR] ' + formatPayload(payload) + '\n'),
    warn: (payload) => console.warn('\n[WARN]  ' + formatPayload(payload) + '\n'),
    info: (payload) => console.info('\n[INFO]  ' + formatPayload(payload) + '\n'),
    debug: (payload) => console.debug('\n[DEBUG] ' + formatPayload(payload) + '\n')
};

module.exports = logger;
