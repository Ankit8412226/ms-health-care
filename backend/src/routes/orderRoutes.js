const express = require('express');
const router = express.Router();
const {
  placeOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { orderValidation } = require('../middleware/validationMiddleware');

// Get history of logged-in user
// @route   GET /api/orders/myorders
router.get('/myorders', protect, getMyOrders);

// Place new order
// @route   POST /api/orders
router.post('/', protect, orderValidation, placeOrder);

// Admin-only list of all orders
// @route   GET /api/orders
router.get('/', protect, adminOnly, getAllOrders);

// Admin-only update order status details
// @route   PUT /api/orders/:id/status
router.put('/:id/status', protect, adminOnly, updateOrderStatus);

module.exports = router;
