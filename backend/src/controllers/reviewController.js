const mongoose = require('mongoose');
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { getPagination, paginatedResponse } = require('../utils/pagination');

/**
 * Recompute a product's rating and review count from the reviews collection.
 *
 * Done with an aggregation rather than by loading every review into memory —
 * this codebase already has products with several hundred reviews, and the
 * previous implementation fetched them all just to average one field.
 */
const recalculateProductRating = async (productId) => {
  const [stats] = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(String(productId)) } },
    { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  await Product.findByIdAndUpdate(productId, {
    rating: stats ? Math.round(stats.avg * 10) / 10 : 0,
    reviewCount: stats ? stats.count : 0,
  });
};

/**
 * @desc    Create a product review
 * @route   POST /api/reviews/:productId
 * @access  Private
 */
const createReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const { productId } = req.params;

  const ratingNum = Number(rating);
  if (!Number.isFinite(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    throw ApiError.badRequest('Rating must be a number between 1 and 5');
  }

  const text = String(comment || '').trim();
  if (!text) throw ApiError.badRequest('Please write a review comment');
  if (text.length > 2000) throw ApiError.badRequest('Review comment must be 2000 characters or fewer');

  const product = await Product.findById(productId).select('_id').lean();
  if (!product) throw ApiError.notFound('Product not found');

  const alreadyReviewed = await Review.findOne({ user: req.user._id, product: productId })
    .select('_id')
    .lean();
  if (alreadyReviewed) {
    throw ApiError.conflict('You have already reviewed this product');
  }

  // Only customers who actually received the product may review it.
  const hasPurchased = await Order.countDocuments({
    user: req.user._id,
    status: 'Delivered',
    'items.product': productId,
  });

  if (hasPurchased === 0) {
    throw ApiError.forbidden(
      'You can only review products you have purchased and received.'
    );
  }

  const review = await Review.create({
    user: req.user._id,
    userName: req.user.name,
    product: productId,
    rating: ratingNum,
    comment: text,
  });

  await recalculateProductRating(productId);

  return res.status(201).json({ success: true, data: review });
});

/**
 * @desc    List reviews for a product
 * @route   GET /api/reviews/:productId
 * @access  Public
 */
const getProductReviews = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req, { defaultLimit: 10 });
  const filter = { product: req.params.productId };

  // This collection holds 5,000+ reviews and the endpoint returned every
  // review for a product in one unbounded response.
  const [data, total] = await Promise.all([
    Review.find(filter).sort({ createdAt: -1, _id: 1 }).skip(skip).limit(limit).lean(),
    Review.countDocuments(filter),
  ]);

  return res.status(200).json(paginatedResponse({ data, total, page, limit }));
});

/**
 * @desc    Report whether the caller may review a product
 * @route   GET /api/reviews/:productId/eligible
 * @access  Private
 */
const checkReviewEligibility = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const [alreadyReviewed, purchaseCount] = await Promise.all([
    Review.findOne({ user: req.user._id, product: productId }).select('_id').lean(),
    Order.countDocuments({ user: req.user._id, status: 'Delivered', 'items.product': productId }),
  ]);

  if (alreadyReviewed) {
    return res.status(200).json({ success: true, eligible: false, reason: 'already_reviewed' });
  }

  return res.status(200).json({
    success: true,
    eligible: purchaseCount > 0,
    reason: purchaseCount > 0 ? 'eligible' : 'no_purchase',
  });
});

module.exports = {
  createReview,
  getProductReviews,
  checkReviewEligibility,
};
