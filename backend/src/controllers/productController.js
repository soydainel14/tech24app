const productModel = require('../models/productModel');

/*
 * Controller functions for product operations. Applies business rules
 * such as enforcing minimum margin (45%) and price floor (cost / 0.55).
 */

async function listProducts(req, res, next) {
  try {
    const products = await productModel.getAll();
    res.json({ products });
  } catch (err) {
    next(err);
  }
}

async function getProduct(req, res, next) {
  try {
    const { id } = req.params;
    const product = await productModel.getById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ product });
  } catch (err) {
    next(err);
  }
}

async function createProduct(req, res, next) {
  try {
    const { name, sku, description, cost, price, stock, status } = req.body;
    if (!name || !sku || cost == null || price == null || stock == null) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const minPrice = cost / 0.55;
    if (price < minPrice) {
      return res.status(400).json({ message: `Price below minimum allowed. Minimum is ${minPrice.toFixed(2)}` });
    }
    const margin = ((price - cost) / price) * 100;
    if (margin < 45) {
      return res.status(400).json({ message: 'Margin below 45%' });
    }
    const data = { name, sku, description, cost, price, stock, status: status || 'active' };
    const product = await productModel.createProduct(data);
    res.status(201).json({ product });
  } catch (err) {
    next(err);
  }
}

async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await productModel.getById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const { cost = existing.cost, price = existing.price } = req.body;
    const minPrice = cost / 0.55;
    if (price < minPrice) {
      return res.status(400).json({ message: `Price below minimum allowed. Minimum is ${minPrice.toFixed(2)}` });
    }
    const margin = ((price - cost) / price) * 100;
    if (margin < 45) {
      return res.status(400).json({ message: 'Margin below 45%' });
    }
    const data = { ...req.body };
    const updated = await productModel.updateProduct(id, data);
    res.json({ product: updated });
  } catch (err) {
    next(err);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await productModel.getById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Product not found' });
    }
    await productModel.deleteProduct(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};