const db = require('../db/connection');
const bcrypt = require('bcryptjs');

/**
 * User model. Provides helper functions for interacting with the users table.
 */
const TABLE_NAME = 'users';

async function getByEmail(email) {
  const user = await db(TABLE_NAME).where({ email }).first();
  return user;
}

async function getById(id) {
  const user = await db(TABLE_NAME).where({ id }).first();
  return user;
}

async function createUser({ name, email, password, role = 'customer' }) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const [id] = await db(TABLE_NAME).insert({ name, email, password: hashedPassword, role });
  return getById(id);
}

module.exports = {
  getByEmail,
  getById,
  createUser,
};