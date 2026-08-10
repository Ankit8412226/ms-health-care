/**
 * Central configuration.
 *
 * Every credential the app needs is resolved here exactly once, so no
 * controller reaches for `process.env` (or an inline literal) on its own.
 *
 * The working values are kept inline as defaults so the API runs on Vercel
 * with no dashboard configuration at all. An environment variable, when set,
 * always wins — so these can be moved to Vercel env vars later without a code
 * change.
 *
 * SECURITY NOTE: these credentials live in the git history and should be
 * treated as public. Rotating them (and then setting the new values as
 * environment variables) is the only real remedy whenever that becomes
 * practical.
 */

const isProduction = process.env.NODE_ENV === 'production';

/** Parse a comma-separated env var into a trimmed, non-empty list. */
const list = (value) =>
  (value || '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

module.exports = {
  isProduction,
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5001,

  mongoUri:
    process.env.MONGO_URI ||
    'mongodb+srv://vankit841226_db_user:SOdHiTG6k7yMTtaz@cluster0.mrmt0yn.mongodb.net/?appName=Cluster0',
  mongoDbName: process.env.MONGO_DB_NAME || 'ms-care',

  jwtSecret: process.env.JWT_SECRET || 'supersecretkeyformedicalcareapp123!',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '30d',

  // Browser origins allowed to call this API. Empty means "reflect any
  // origin", which is what the API did before and keeps preview deployments
  // working; set CORS_ORIGINS to lock it down.
  corsOrigins: list(process.env.CORS_ORIGINS),

  // Uploads go straight from the browser to Cloudinary using a signature this
  // API mints, so image bytes never traverse the API at all.
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'dqy6dki64',
    apiKey: process.env.CLOUDINARY_API_KEY || '618684992729621',
    apiSecret: process.env.CLOUDINARY_API_SECRET || 'CYKdNnUYfA4RwwGvKtsrI47TMoo',
    get configured() {
      return Boolean(this.cloudName && this.apiKey && this.apiSecret);
    },
  },

  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_live_SwTSEkWxau6fbi',
    keySecret: process.env.RAZORPAY_KEY_SECRET || 'I0NySzSeypRaJCFr3G5wBBY2',
    get configured() {
      return Boolean(this.keyId && this.keySecret);
    },
  },

  shiprocket: {
    email: process.env.SHIPROCKET_EMAIL || 'mohdaffanahmad007@gmail.com',
    // Kept as a literal deliberately: dotenv treats an unquoted '#' as the
    // start of a comment, so this value silently truncates to
    // "fbggKvwZFrQ40Dk6EUgPKw&" unless it is quoted in the .env file.
    password: process.env.SHIPROCKET_PASSWORD || 'fbggKvwZFrQ40Dk6EUgPKw&#O#Ea&dZf',
    get configured() {
      return Boolean(this.email && this.password);
    },
  },

  // Request body ceiling. Image bytes no longer flow through here, so this
  // only has to cover JSON documents. The old value was Express's 100 KB
  // default, which rejected every product and prescription image.
  jsonBodyLimit: process.env.JSON_BODY_LIMIT || '2mb',

  // Largest upload the signature endpoint will authorise, in bytes.
  maxUploadBytes: parseInt(process.env.MAX_UPLOAD_BYTES, 10) || 10 * 1024 * 1024,
};
