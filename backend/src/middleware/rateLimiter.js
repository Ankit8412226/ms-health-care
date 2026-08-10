const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');

/**
 * Normalise a client IP into a limiter key.
 *
 * Using req.ip verbatim is unsafe for IPv6: a single customer is typically
 * handed a whole /64, so they could rotate through addresses and never hit a
 * limit. ipKeyGenerator collapses the prefix for us.
 */
const clientKey = (req) => ipKeyGenerator(req.ip);

/**
 * Rate limiters.
 *
 * Caveat worth knowing before relying on these: the store is in-memory, so on
 * Vercel each serverless instance keeps its own counters and the effective
 * limit is (instances x limit). That is still worth having as a brake on
 * credential stuffing, but if you need a hard guarantee, back these with Redis
 * (`rate-limit-redis`) or put the limit in Cloudflare / an ALB in front of EC2.
 */

const jsonLimitHandler = (message) => (req, res) => {
  res.status(429).json({ success: false, message });
};

/** Baseline limit applied to the whole API. */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: jsonLimitHandler('Too many requests. Please slow down and try again shortly.'),
});

/**
 * Tight limit on credential endpoints.
 *
 * Keyed on IP + submitted email so one attacker cannot lock out every user
 * behind a shared NAT, and successful logins are not counted.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: (req) => `${clientKey(req)}:${String(req.body?.email || '').toLowerCase()}`,
  handler: jsonLimitHandler('Too many login attempts. Please try again in 15 minutes.'),
});

/**
 * Limit on upload-signature minting.
 *
 * Each signature authorises a write to Cloudinary, so this caps how much
 * storage a single compromised account can burn.
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  // Signed-in callers are limited per account; anonymous ones fall back to IP.
  keyGenerator: (req) => (req.user?._id ? `user:${req.user._id}` : clientKey(req)),
  handler: jsonLimitHandler('Upload limit reached. Please try again later.'),
});

/** Limit on writes that create records from anonymous callers. */
const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: jsonLimitHandler('Too many submissions. Please try again shortly.'),
});

module.exports = { apiLimiter, authLimiter, uploadLimiter, writeLimiter };
