const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');

// @desc    Create new product review
// @route   POST /api/reviews/:productId
// @access  Private
const createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.productId;

    if (!rating || !comment) {
      return res.status(400).json({ success: false, message: 'Please provide rating and comment' });
    }

    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be a number between 1 and 5' });
    }

    // 1. Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // 2. Check if user already reviewed
    const alreadyReviewed = await Review.findOne({ user: req.user._id, product: productId });
    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
    }

    // 3. Verify user has purchased this product and it has been delivered
    const hasPurchased = await Order.countDocuments({
      user: req.user._id,
      status: 'Delivered',
      'items.product': productId
    });

    if (hasPurchased === 0) {
      return res.status(403).json({
        success: false,
        message: 'Bhai, safety check! You can only review products you have purchased and received (Delivered status).'
      });
    }

    // 4. Create review
    const review = await Review.create({
      user: req.user._id,
      userName: req.user.name,
      product: productId,
      rating: ratingNum,
      comment: comment.trim()
    });

    // 5. Recalculate average rating and reviewCount for product
    const reviews = await Review.find({ product: productId });
    const reviewCount = reviews.length;
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount;

    product.rating = Math.round(avgRating * 10) / 10;
    product.reviewCount = reviewCount;
    await product.save();

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all reviews for a product
// @route   GET /api/reviews/:productId
// @access  Public
const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Check if active user is eligible to write a review
// @route   GET /api/reviews/:productId/eligible
// @access  Private
const checkReviewEligibility = async (req, res) => {
  try {
    const productId = req.params.productId;

    const alreadyReviewed = await Review.findOne({ user: req.user._id, product: productId });
    if (alreadyReviewed) {
      return res.status(200).json({ success: true, eligible: false, reason: 'already_reviewed' });
    }

    const hasPurchased = await Order.countDocuments({
      user: req.user._id,
      status: 'Delivered',
      'items.product': productId
    });

    res.status(200).json({
      success: true,
      eligible: hasPurchased > 0,
      reason: hasPurchased > 0 ? 'eligible' : 'no_purchase'
    });
  } catch (error) {
    console.error('Error checking review eligibility:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  createReview,
  getProductReviews,
  checkReviewEligibility
};
