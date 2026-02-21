const logger = {
    error: (payload) => console.error(JSON.stringify(payload)),
    warn: (payload) => console.warn(JSON.stringify(payload)),
    info: (payload) => console.info(JSON.stringify(payload)),
    debug: (payload) => console.debug(JSON.stringify(payload))
}

module.exports = logger
