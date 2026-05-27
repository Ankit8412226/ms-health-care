const express = require('express');
const router = express.Router();
const { registerUser, loginUser, loginAdmin } = require('../controllers/authController');
const { registerValidation, loginValidation } = require('../middleware/validationMiddleware');

// @route   POST /api/auth/register
router.post('/register', registerValidation, registerUser);

// @route   POST /api/auth/login
router.post('/login', loginValidation, loginUser);

// @route   POST /api/auth/admin/login
router.post('/admin/login', loginValidation, loginAdmin);

module.exports = router;
