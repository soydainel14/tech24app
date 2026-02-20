const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// 1. Get orders for logged in user (BEFORE /:id)
router.get('/my', authenticate, orderController.getMyOrders);

// 2. Confirm payment (admin) (BEFORE /:id)
router.post('/:id/confirm-payment', authenticate, authorize(['admin']), orderController.confirmPayment);

// 3. Get order details
router.get('/:id', authenticate, orderController.getOrder);

// 4. Create order (customer)
router.post('/', authenticate, orderController.createOrder);

module.exports = router;
