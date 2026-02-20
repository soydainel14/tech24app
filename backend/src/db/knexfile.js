const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

function buildConnection() {
  if (process.env.DATABASE_URL) {
    return {
      connection: process.env.DATABASE_URL,
    };
  }

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
      user,
      password,
      database,
      charset: 'utf8mb4',
      ssl: process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
    },
  };
}

const commonConfig = {
  client: 'mysql2',
  migrations: {
    directory: path.join(__dirname, '..', 'migrations'),
    tableName: 'migrations',
  },
  seeds: {
    directory: path.join(__dirname, '..', 'seeds'),
  },
  pool: {
    min: 2,
    max: 5,
    acquireTimeoutMillis: 10000,
    createTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
  },
};

module.exports = {
  development: {
    ...commonConfig,
    ...buildConnection(),
  },
  production: {
    ...commonConfig,
    ...buildConnection(),
  },
};
