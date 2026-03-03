const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') }); // Load .env from backend root

module.exports = {
    development: {
        use_env_variable: 'DATABASE_URL',
        dialect: 'postgres',
        logging: true,
        dialectOptions: {
            ssl: false
        }
    },
    test: {
        use_env_variable: 'DATABASE_URL',
        dialect: 'postgres',
        logging: true,
        dialectOptions: {
            ssl: {
                rejectUnauthorized: false
            }
        }
    },
    production: {
        use_env_variable: 'DATABASE_URL',
        dialect: 'postgres',
        logging: false,
        dialectOptions: {
            ssl: {
                rejectUnauthorized: false
            }
        }
    }
};
