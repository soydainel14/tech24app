const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// Create order (customer)
router.post('/', authenticate, orderController.createOrder);

// Get order details
router.get('/:id', authenticate, orderController.getOrder);

// Get orders for logged in user
router.get('/my', authenticate, orderController.getMyOrders);

// Confirm payment (admin)
router.post('/:id/confirm-payment', authenticate, authorize(['admin']), orderController.confirmPayment);

module.exports = router;