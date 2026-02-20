const db = require('../db/connection');

const TABLE_NAME = 'products';

async function getAll() {
  return db(TABLE_NAME).select('*');
}

async function getById(id) {
  return db(TABLE_NAME).where({ id }).first();
}

async function createProduct(data) {
  const [id] = await db(TABLE_NAME).insert(data);
  return getById(id);
}

async function updateProduct(id, data) {
  await db(TABLE_NAME).where({ id }).update(data);
  return getById(id);
}

async function deleteProduct(id) {
  return db(TABLE_NAME).where({ id }).del();
}

module.exports = {
  getAll,
  getById,
  createProduct,
  updateProduct,
  deleteProduct,
};