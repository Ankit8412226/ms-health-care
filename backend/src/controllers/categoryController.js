const Category = require('../models/Category');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { getPagination, paginatedResponse } = require('../utils/pagination');

/**
 * @desc    List categories
 * @route   GET /api/categories
 * @access  Public
 */
const getCategories = asyncHandler(async (req, res) => {
  // Categories are a small, bounded set the storefront renders in full, so the
  // default limit is generous — but it is still a limit.
  const { page, limit, skip } = getPagination(req, { defaultLimit: 100 });

  const [data, total] = await Promise.all([
    Category.find({}).sort({ name: 1 }).skip(skip).limit(limit).lean(),
    Category.countDocuments({}),
  ]);

  return res.status(200).json(paginatedResponse({ data, total, page, limit }));
});

/**
 * @desc    Create a category
 * @route   POST /api/categories
 * @access  Private/Admin
 */
const createCategory = asyncHandler(async (req, res) => {
  const name = String(req.body.name).trim();
  const { icon } = req.body;

  // Case-insensitive exact match, so "Wellness" cannot be added alongside an
  // existing "wellness". Anchored and escaped to keep it an equality test.
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const exists = await Category.findOne({ name: new RegExp(`^${escaped}$`, 'i') })
    .select('_id')
    .lean();
  if (exists) throw ApiError.conflict('A category with this name already exists');

  const category = await Category.create({ name, icon });
  return res.status(201).json({ success: true, data: category });
});

/**
 * @desc    Delete a category
 * @route   DELETE /api/categories/:id
 * @access  Private/Admin
 */
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id).lean();
  if (!category) throw ApiError.notFound('Category not found');

  // Refuse to orphan products. Deleting a category used to succeed regardless,
  // leaving its products pointing at a slug that no longer resolved — they
  // disappeared from every category filter with no indication why.
  const inUse = await Product.countDocuments({ category: category.slug });
  if (inUse > 0) {
    throw ApiError.conflict(
      `Cannot delete "${category.name}": ${inUse} product(s) still use it. Reassign those products first.`
    );
  }

  await Category.findByIdAndDelete(req.params.id);

  return res.status(200).json({
    success: true,
    message: 'Category deleted successfully',
    data: { id: category._id },
  });
});

module.exports = {
  getCategories,
  createCategory,
  deleteCategory,
};
