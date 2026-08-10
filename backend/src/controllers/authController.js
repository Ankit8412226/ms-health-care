const jwt = require('jsonwebtoken');
const User = require('../models/User');
const env = require('../config/env');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

const generateToken = (id) =>
  jwt.sign({ id }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

/** Shape a user document for a response. Never includes the password hash. */
const authPayload = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  token: generateToken(user._id),
});

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  // SECURITY: `role` is deliberately NOT read from the request body.
  //
  // This endpoint used to do `role: role || 'user'`, and the validator
  // explicitly permitted `role: 'admin'`. That meant anyone on the internet
  // could POST to /api/auth/register with {"role":"admin"} and receive an
  // administrator token — granting full product CRUD, every customer's address
  // and phone number, all orders, and every uploaded prescription.
  //
  // New accounts are always ordinary users. Promote an administrator
  // deliberately and out of band, never from an unauthenticated public request.
  const normalisedEmail = String(email).toLowerCase().trim();

  const userExists = await User.findOne({ email: normalisedEmail }).select('_id').lean();
  if (userExists) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const user = await User.create({
    name,
    email: normalisedEmail,
    password,
    phone,
    role: 'user',
  });

  return res.status(201).json({ success: true, data: authPayload(user) });
});

/**
 * @desc    Authenticate a user and issue a token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: String(email).toLowerCase().trim() });

  // One message covers both "no such account" and "wrong password", so the
  // response cannot be used to enumerate which emails are registered.
  if (!user || !(await user.matchPassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  return res.status(200).json({ success: true, data: authPayload(user) });
});

/**
 * @desc    Authenticate an administrator
 * @route   POST /api/auth/admin/login
 * @access  Public
 */
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: String(email).toLowerCase().trim() });

  if (!user || !(await user.matchPassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  // The role is checked only after the password verifies. The previous order
  // returned a distinct 403 for a non-admin account before checking the
  // password at all, which confirmed to an attacker that the email exists.
  if (user.role !== 'admin') {
    throw ApiError.forbidden('Access denied: this account does not have administrator privileges');
  }

  return res.status(200).json({ success: true, data: authPayload(user) });
});

/**
 * @desc    Return the signed-in user, so a client can validate a stored token
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) =>
  res.status(200).json({
    success: true,
    data: {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
    },
  })
);

module.exports = {
  registerUser,
  loginUser,
  loginAdmin,
  getMe,
};
