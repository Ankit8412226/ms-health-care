const express = require('express');
const router = express.Router();
const {
  createShipment,
  trackOrder,
  trackMyOrder,
  cancelShipment,
} = require('../controllers/shiprocketController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// ── Admin: Create shipment for an existing order ──────────────────────────
// @route   POST /api/shiprocket/create/:orderId
router.post('/create/:orderId', protect, adminOnly, createShipment);

// ── Admin: Cancel a shipment ──────────────────────────────────────────────
// @route   POST /api/shiprocket/cancel/:orderId
router.post('/cancel/:orderId', protect, adminOnly, cancelShipment);

// ── User + Admin: Track an order by orderId (OD-XXXXXX or _id) ───────────
// @route   GET /api/shiprocket/track/:orderId
router.get('/track/:orderId', protect, trackOrder);

module.exports = router;
