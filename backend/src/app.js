const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const env = require('./config/env');
const routes = require('./routes');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();

// Trust the platform proxy so req.ip is the real client address rather than
// the load balancer's. Rate limiting keys on req.ip, so without this every
// request shares one bucket.
app.set('trust proxy', 1);
app.disable('x-powered-by');

// ── Security headers ──────────────────────────────────────────────────────
// This is a JSON API serving a separate frontend origin, so CSP (aimed at HTML
// responses) is off and CORP is relaxed to permit cross-origin reads.
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(compression());

// ── CORS ──────────────────────────────────────────────────────────────────
// Open by default so the storefront, the admin panel and Vercel preview
// deployments all keep working with no configuration. Setting CORS_ORIGINS to
// a comma-separated list of origins switches this to an allowlist, which is
// worth doing for an API that serves medical records.
const corsOptions = {
  origin(origin, callback) {
    // Same-origin, curl and server-to-server calls send no Origin header.
    if (!origin) return callback(null, true);
    if (env.corsOrigins.length === 0) return callback(null, true);
    if (env.corsOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`Origin ${origin} is not allowed by CORS policy`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  maxAge: 86400,
};
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

// ── Body parsing ──────────────────────────────────────────────────────────
// The old default was Express's built-in 100 KB, which rejected every
// prescription photo and every product image with a 413 long before the
// request reached a controller. Image bytes now go straight from the browser
// to Cloudinary, so this ceiling only has to cover JSON documents.
app.use(express.json({ limit: env.jsonBodyLimit }));
app.use(express.urlencoded({ extended: true, limit: env.jsonBodyLimit }));

// ── Database ──────────────────────────────────────────────────────────────
// Await the connection per request, and only for routes that need it. On
// serverless the cached promise is reused after the first invocation, so this
// costs nothing on a warm instance, but it means a cold start reports a clean
// 503 instead of stalling on Mongoose's command buffer until the platform
// times the request out.
const requireDatabase = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
};

// Liveness probe. Mounted before the database gate so it still answers while
// the database is down — otherwise the health check fails for the one reason
// you most need it to keep reporting.
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, status: 'ok', uptime: process.uptime() });
});

// ── Routes ────────────────────────────────────────────────────────────────
app.use('/api', apiLimiter, requireDatabase, routes);

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the MS Care Healthcare API',
  });
});

// ── Error handling (must be registered last) ──────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
