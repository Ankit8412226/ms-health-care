const express = require('express');
const router = express.Router();
const {
  getCategories,
  createCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { categoryValidation } = require('../middleware/validationMiddleware');

// Public route to fetch all categories
// @route   GET /api/categories
router.get('/', getCategories);

// Admin-guarded route to create category
// @route   POST /api/categories
router.post('/', protect, adminOnly, categoryValidation, createCategory);

// Admin-guarded route to delete category
// @route   DELETE /api/categories/:id
router.delete('/:id', protect, adminOnly, deleteCategory);

module.exports = router;
