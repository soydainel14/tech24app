const orderModel = require('../models/orderModel');

/**
 * Create a new order for the authenticated user.
 */
async function createOrder(req, res, next) {
  try {
    const { items, paymentMethod, shippingAddressId } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items are required' });
    }
    const order = await orderModel.createOrder({
      userId: req.user.id,
      items,
      paymentMethod,
      shippingAddressId
    });
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
}

/**
 * Get details of a specific order.
 */
async function getOrder(req, res, next) {
  try {
    const order = await orderModel.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    // Only the owner or an admin can see the order
    if (order.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(order);
  } catch (err) {
    next(err);
  }
}

/**
 * Get all orders for the authenticated user.
 */
async function getMyOrders(req, res, next) {
  try {
    const db = require('../db/connection');
    const orders = await db('orders').where({ user_id: req.user.id }).orderBy('created_at', 'desc');
    res.json(orders);
  } catch (err) {
    next(err);
  }
}

/**
 * Confirm payment for an order (Admin only).
 */
async function confirmPayment(req, res, next) {
  try {
    const order = await orderModel.confirmPayment(req.params.id);
    res.json(order);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createOrder,
  getOrder,
  getMyOrders,
  confirmPayment,
};
