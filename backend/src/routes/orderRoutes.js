const express = require('express');
const router = express.Router();
const {
  placeOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  createRazorpayOrder,
  verifyRazorpayPayment,
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { orderValidation } = require('../middleware/validationMiddleware');

// Get history of logged-in user
// @route   GET /api/orders/myorders
router.get('/myorders', protect, getMyOrders);

// Place new order
// @route   POST /api/orders
router.post('/', protect, orderValidation, placeOrder);

// Create Razorpay order
// @route   POST /api/orders/razorpay-order
router.post('/razorpay-order', protect, createRazorpayOrder);

// Verify Razorpay signature
// @route   POST /api/orders/razorpay-verify
router.post('/razorpay-verify', protect, verifyRazorpayPayment);

// Admin-only list of all orders
// @route   GET /api/orders
router.get('/', protect, adminOnly, getAllOrders);

// Admin-only update order status details
// @route   PUT /api/orders/:id/status
router.put('/:id/status', protect, adminOnly, updateOrderStatus);

module.exports = router;
