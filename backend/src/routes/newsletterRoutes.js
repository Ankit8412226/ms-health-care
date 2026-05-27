const express = require('express');
const router = express.Router();
const { subscribeNewsletter } = require('../controllers/newsletterController');
const { newsletterValidation } = require('../middleware/validationMiddleware');

// @route   POST /api/newsletters
router.post('/', newsletterValidation, subscribeNewsletter);

module.exports = router;
