const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// Get orders for logged in user (Must be BEFORE /:id)
router.get('/my', authenticate, orderController.getMyOrders);

// Get order details
router.get('/:id', authenticate, orderController.getOrder);

// Create order (customer)
router.post('/', authenticate, orderController.createOrder);

// Confirm payment (admin)
router.post('/:id/confirm-payment', authenticate, authorize(['admin']), orderController.confirmPayment);

module.exports = router;
