const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { productValidation, productUpdateValidation } = require('../middleware/validationMiddleware');

// Public route to fetch all products
// @route   GET /api/products
router.get('/', getProducts);

// Public route to fetch product by ID or Slug
// @route   GET /api/products/:idOrSlug
router.get('/:idOrSlug', getProductById);

// Admin-guarded route to create product
// @route   POST /api/products
router.post('/', protect, adminOnly, productValidation, createProduct);

// Admin-guarded route to update product
// @route   PUT /api/products/:id
router.put('/:id', protect, adminOnly, productUpdateValidation, updateProduct);

// Admin-guarded route to delete product
// @route   DELETE /api/products/:id
router.delete('/:id', protect, adminOnly, deleteProduct);

module.exports = router;
