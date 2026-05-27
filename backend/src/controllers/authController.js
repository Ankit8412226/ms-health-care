const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper function to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretkeyformedicalcareapp123!', {
    expiresIn: '30d',
  });
};

/**
 * @desc    Register a new user (role can be 'user' or 'admin' depending on request)
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user', // Default to normal user
    });

    if (user) {
      return res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id),
        },
      });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid user data provided' });
    }
  } catch (error) {
    console.error('Register Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server Error occurred during registration' });
  }
};

/**
 * @desc    Auth user & get token (Normal User Login)
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      return res.status(200).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id),
        },
      });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server Error occurred during login' });
  }
};

/**
 * @desc    Auth admin & get token (Admin Login Guarded)
 * @route   POST /api/auth/admin/login
 * @access  Public
 */
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Verify role is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied: You do not have administrator privileges' });
    }

    if (await user.matchPassword(password)) {
      return res.status(200).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id),
        },
      });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Admin Login Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server Error occurred during admin login' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  loginAdmin,
};
