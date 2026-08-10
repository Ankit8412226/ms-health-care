const express = require('express');
const router = express.Router();
const { getUploadSignature } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');
const { uploadLimiter } = require('../middleware/rateLimiter');

// Mint a signature for a direct browser -> Cloudinary upload.
// @route   POST /api/uploads/signature
router.post('/signature', protect, uploadLimiter, getUploadSignature);

module.exports = router;
