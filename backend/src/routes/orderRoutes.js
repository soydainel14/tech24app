const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// 1. Specific static routes (BEFORE any parameterized routes)
router.get('/my', authenticate, orderController.getMyOrders);

// 2. Parameterized routes with specific actions (BEFORE generic /:id)
router.post('/:id/confirm-payment', authenticate, authorize(['admin']), orderController.confirmPayment);

// 3. Generic parameterized routes (LAST)
router.get('/:id', authenticate, orderController.getOrder);

// 4. Base route
router.post('/', authenticate, orderController.createOrder);

module.exports = router;
