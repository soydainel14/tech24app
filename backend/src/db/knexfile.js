// Load environment variables from the project root. Without specifying
// the path here, dotenv will look relative to the current working
// directory. When knex is executed via CLI, it changes the working
// directory to src/db, so the default lookup will not find the root
// .env file. To ensure the database credentials are loaded correctly
// in all contexts (development and production), resolve the .env
// located two directories up (project root).
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

/*
 * This knex configuration reads database connection details from
 * environment variables in a prioritized order, as required for
 * Railway compatibility. The order is:
 *   1. DATABASE_URL – a full MySQL connection string
 *   2. MYSQLHOST, MYSQLPORT, MYSQLUSER, MYSQLPASSWORD, MYSQLDATABASE
 *   3. DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME
 *
 * The configuration is exported for the development environment. The
 * same connection options are used for production because Railway will
 * inject the correct secrets via environment variables. The knex CLI
 * will pick up this file when running migrations and seeds via the
 * provided npm scripts.
 */

function buildConnection() {
  if (process.env.DATABASE_URL) {
    return {
      connection: process.env.DATABASE_URL,
    };
  }
  // Fallback to MYSQL prefixed variables
  const mysqlHost = process.env.MYSQLHOST || process.env.DB_HOST;
  const mysqlPort = process.env.MYSQLPORT || process.env.DB_PORT || 3306;
  const mysqlUser = process.env.MYSQLUSER || process.env.DB_USER;
  const mysqlPassword = process.env.MYSQLPASSWORD || process.env.DB_PASS;
  const mysqlDatabase = process.env.MYSQLDATABASE || process.env.DB_NAME;
  return {
    connection: {
      host: mysqlHost,
      port: Number(mysqlPort),
      user: mysqlUser,
      password: mysqlPassword,
      database: mysqlDatabase,
      charset: 'utf8mb4',
    },
  };
}

const baseConfig = {
  client: 'mysql2',
  ...buildConnection(),
  migrations: {
    directory: __dirname + '/../migrations',
    tableName: 'migrations',
  },
  seeds: {
    directory: __dirname + '/../seeds',
  },
};

module.exports = {
  development: baseConfig,
  production: baseConfig,
};