const dotenv = require('dotenv');
// Load environment variables before anything reads them.
dotenv.config();

const env = require('./config/env');
const app = require('./app');
const connectDB = require('./config/db');

// Connect eagerly so a bad connection string fails at boot rather than on the
// first customer request. The per-request middleware in app.js reuses this
// same cached connection.
connectDB().catch((err) => {
  console.error(`Database Connection Error: ${err.message}`);
  process.exit(1);
});

const server = app.listen(env.port, () => {
  console.log(`Server running in ${env.nodeEnv} mode on port ${env.port}`);
});

// Fail fast on an unhandled rejection, but drain in-flight requests first.
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err?.message || err}`);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.error(`Uncaught Exception: ${err?.message || err}`);
  server.close(() => process.exit(1));
});

// Let the platform stop the process cleanly instead of severing open sockets.
for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => {
    console.log(`${signal} received, shutting down gracefully`);
    server.close(() => process.exit(0));
  });
}
