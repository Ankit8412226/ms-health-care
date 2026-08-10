const Newsletter = require('../models/Newsletter');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Subscribe to the newsletter
 * @route   POST /api/newsletters
 * @access  Public
 */
const subscribeNewsletter = asyncHandler(async (req, res) => {
  const email = String(req.body.email).toLowerCase().trim();

  const existing = await Newsletter.findOne({ email }).select('_id').lean();

  // Answering 200 for an address that is already subscribed, rather than the
  // previous 400, keeps this endpoint from doubling as a way to test whether a
  // given email is on the list — and re-subscribing is not a user error.
  if (existing) {
    return res.status(200).json({
      success: true,
      message: 'You are already subscribed to our newsletter.',
    });
  }

  await Newsletter.create({ email });

  return res.status(201).json({
    success: true,
    message: 'Subscribed to newsletter successfully!',
  });
});

module.exports = { subscribeNewsletter };
