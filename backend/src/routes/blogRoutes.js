const express = require('express');
const router = express.Router();
const {
  getBlogs,
  getBlogByIdentifier,
  createBlog,
  updateBlog,
  deleteBlog,
} = require('../controllers/blogController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getBlogs);
router.get('/:identifier', getBlogByIdentifier);

// Admin-guarded routes
router.post('/', protect, adminOnly, createBlog);
router.put('/:id', protect, adminOnly, updateBlog);
router.delete('/:id', protect, adminOnly, deleteBlog);

module.exports = router;
