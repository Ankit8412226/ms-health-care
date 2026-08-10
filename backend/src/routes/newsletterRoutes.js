const express = require('express');
const router = express.Router();
const { subscribeNewsletter } = require('../controllers/newsletterController');
const { newsletterValidation } = require('../middleware/validationMiddleware');
const { writeLimiter } = require('../middleware/rateLimiter');

// Public and unauthenticated, so it is rate limited to stop list stuffing.
// @route   POST /api/newsletters
router.post('/', writeLimiter, newsletterValidation, subscribeNewsletter);

module.exports = router;
