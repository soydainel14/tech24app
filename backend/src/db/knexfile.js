const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Builds the database connection object based on environment variables.
 * Prioritizes DATABASE_URL (Railway) or specific MYSQLHOST/DB_HOST vars.
 */
function buildConnection() {
  if (process.env.DATABASE_URL) {
    return {
      connection: process.env.DATABASE_URL,
    };
  }

  // Fallback to specific variables, ensuring no default 'localhost' in production
  const host = process.env.MYSQLHOST || process.env.DB_HOST;
  const port = process.env.MYSQLPORT || process.env.DB_PORT || 3306;
  const user = process.env.MYSQLUSER || process.env.DB_USER;
  const password = process.env.MYSQLPASSWORD || process.env.DB_PASS;
  const database = process.env.MYSQLDATABASE || process.env.DB_NAME;

  if (!host && process.env.NODE_ENV === 'production') {
    throw new Error('Database host is not defined for production environment');
  }

  return {
    connection: {
      host: host || 'localhost',
      port: Number(port),
      user: user,
      password: password,
      database: database,
      charset: 'utf8mb4',
    },
  };
}

const baseConfig = {
  client: 'mysql2',
  ...buildConnection(),
  migrations: {
    directory: path.join(__dirname, '..', 'migrations'),
    tableName: 'migrations',
  },
  seeds: {
    directory: path.join(__dirname, '..', 'seeds'),
  },
  pool: {
    min: 2,
    max: 10
  }
};

module.exports = {
  development: baseConfig,
  production: {
    ...baseConfig,
    // Ensure production always uses the dynamic connection
    ...buildConnection()
  },
};
