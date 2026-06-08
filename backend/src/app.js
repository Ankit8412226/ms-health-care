const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();

// Enable Cross-Origin Resource Sharing (CORS)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Body parser middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount all API routes under the /api prefix
app.use('/api', routes);

// Base test endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the MS Care Healthcare API',
  });
});

// Global 404 Route Not Found Middleware
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource Not Found - ${req.originalUrl}`,
  });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;
