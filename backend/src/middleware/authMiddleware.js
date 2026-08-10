const jwt = require('jsonwebtoken');
const User = require('../models/User');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Require a valid bearer token and attach the user to the request.
 */
const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';

  if (!header.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Not authorized, no token provided');
  }

  const token = header.slice(7).trim();
  if (!token) throw ApiError.unauthorized('Not authorized, no token provided');

  let decoded;
  try {
    decoded = jwt.verify(token, env.jwtSecret);
  } catch (err) {
    // Distinguish an expired session from a bad token so the client can
    // prompt a fresh login rather than showing a generic failure.
    if (err.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Session expired, please sign in again');
    }
    throw ApiError.unauthorized('Not authorized, token failed');
  }

  const user = await User.findById(decoded.id).select('-password').lean();
  if (!user) {
    // The account was deleted after the token was issued.
    throw ApiError.unauthorized('Not authorized, user no longer exists');
  }

  req.user = user;
  next();
});

/** Require the authenticated user to be an administrator. */
const adminOnly = (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  next(ApiError.forbidden('Access denied: administrator authorization required'));
};

module.exports = { protect, adminOnly };
