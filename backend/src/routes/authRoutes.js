const express = require('express');
const router = express.Router();
const { registerUser, loginUser, loginAdmin, getMe } = require('../controllers/authController');
const { registerValidation, loginValidation } = require('../middleware/validationMiddleware');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

// Credential endpoints are rate limited to blunt password guessing.
// @route   POST /api/auth/register
router.post('/register', authLimiter, registerValidation, registerUser);

// @route   POST /api/auth/login
router.post('/login', authLimiter, loginValidation, loginUser);

// @route   POST /api/auth/admin/login
router.post('/admin/login', authLimiter, loginValidation, loginAdmin);

// Lets a client verify a token stored in localStorage is still valid.
// @route   GET /api/auth/me
router.get('/me', protect, getMe);

module.exports = router;
