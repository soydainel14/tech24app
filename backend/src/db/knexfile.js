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

  // Fallback to specific variables, ensuring no default 'localhost' or '::1' in production
  const host = process.env.MYSQLHOST || process.env.DB_HOST;
  const port = process.env.MYSQLPORT || process.env.DB_PORT || 3306;
  const user = process.env.MYSQLUSER || process.env.DB_USER;
  const password = process.env.MYSQLPASSWORD || process.env.DB_PASS;
  const database = process.env.MYSQLDATABASE || process.env.DB_NAME;

  if (process.env.NODE_ENV === 'production' && !host) {
    // If in production and no host is provided, throw a clear error to avoid '::1' fallback
    throw new Error('DATABASE_URL or MYSQLHOST must be defined in production environment');
  }

  return {
    connection: {
      host: host || '127.0.0.1', // Use IPv4 loopback instead of localhost/::1 for stability
      port: Number(port),
      user: user,
      password: password,
      database: database,
      charset: 'utf8mb4',
      ssl: process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
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
    max: 10,
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 100,
    propagateCreateError: false // prevent pool creation errors from crashing the process immediately
  }
};

module.exports = {
  development: baseConfig,
  production: {
    ...baseConfig,
    // Ensure production always re-evaluates the connection
    ...buildConnection()
  },
};
