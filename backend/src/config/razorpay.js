const Razorpay = require('razorpay');
const env = require('./env');

/**
 * Razorpay client.
 *
 * Credentials resolve through config/env.js, which keeps the working live key
 * pair as its built-in default — so this needs no setup on Vercel — while
 * still letting RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET override it.
 */

// Razorpay's constructor throws on empty credentials, so when payments are not
// configured we expose a stub whose methods fail with a clear message instead
// of taking the whole API down at import time.
const notConfigured = () => {
  throw new Error(
    'Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.'
  );
};

const razorpay = env.razorpay.configured
  ? new Razorpay({ key_id: env.razorpay.keyId, key_secret: env.razorpay.keySecret })
  : { orders: { create: notConfigured }, payments: { fetch: notConfigured } };

module.exports = razorpay;
