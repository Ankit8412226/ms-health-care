const Newsletter = require('../models/Newsletter');

/**
 * @desc    Subscribe to newsletter
 * @route   POST /api/newsletters
 * @access  Public
 */
const subscribeNewsletter = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if email already subscribed
    const existing = await Newsletter.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'This email is already subscribed to our newsletter.',
      });
    }

    const newsletter = await Newsletter.create({ email });

    return res.status(201).json({
      success: true,
      message: 'Subscribed to newsletter successfully!',
      data: newsletter,
    });
  } catch (error) {
    console.error('Newsletter Subscribe Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server Error occurred during newsletter subscription',
    });
  }
};

module.exports = {
  subscribeNewsletter,
};
