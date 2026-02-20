const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const orderModel = require('../models/orderModel');
// Additional admin controllers could be imported here (e.g. financeController)

// Middleware: all admin routes require admin role
router.use(authenticate, authorize(['admin']));

// List all orders
router.get('/orders', async (req, res, next) => {
  try {
    // In a real implementation, pagination and filtering would be added
    const db = require('../db/connection');
    const orders = await db('orders').select('*');
    res.json({ orders });
  } catch (err) {
    next(err);
  }
});

// Additional admin endpoints can be added here (e.g. to manage expenses, KPIs, etc.)

module.exports = router;