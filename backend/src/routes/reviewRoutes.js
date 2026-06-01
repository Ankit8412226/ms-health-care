const express = require('express');
const router = express.Router();
const { createReview, getProductReviews, checkReviewEligibility } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/:productId', getProductReviews);

// Protected routes
router.post('/:productId', protect, createReview);
router.get('/:productId/eligible', protect, checkReviewEligibility);

module.exports = router;
