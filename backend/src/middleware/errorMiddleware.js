const ApiError = require('../utils/ApiError');
const env = require('../config/env');

/** Terminal 404 handler for unmatched routes. */
const notFound = (req, res, next) => {
  next(ApiError.notFound(`Resource Not Found - ${req.method} ${req.originalUrl}`));
};

/**
 * Translate a thrown error into an HTTP response.
 *
 * Previously every controller swallowed its own errors and answered with a
 * generic "Server Error ..." 500. That is why a duplicate product slug, a
 * malformed ObjectId and a genuinely broken database all looked identical to
 * the admin panel. Here each failure mode is mapped to the status code and
 * message that actually describes it.
 */
// eslint-disable-next-line no-unused-vars -- Express identifies error handlers by arity
const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    // Invalid ObjectId in a path or filter -> the resource cannot exist.
    if (error.name === 'CastError') {
      error = ApiError.badRequest(`Invalid ${error.path}: ${error.value}`);

    // Mongoose schema validation -> surface the per-field messages.
    } else if (error.name === 'ValidationError') {
      const details = Object.values(error.errors || {}).map((e) => ({
        field: e.path,
        message: e.message,
      }));
      error = ApiError.badRequest('Validation failed', details);

    // Unique index violation -> name the conflicting field.
    } else if (error.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0] || 'field';
      const value = (error.keyValue || {})[field];
      error = ApiError.conflict(
        `A record with this ${field} already exists${value ? ` (${value})` : ''}`,
        [{ field, message: 'Must be unique' }]
      );

    // Body parser rejected an oversized payload.
    } else if (error.type === 'entity.too.large' || error.status === 413) {
      error = ApiError.payloadTooLarge(
        `Request body exceeds the ${env.jsonBodyLimit} limit. Images must be uploaded directly to the storage provider, not sent through this API.`
      );

    // Malformed JSON body.
    } else if (error.type === 'entity.parse.failed' || error instanceof SyntaxError) {
      error = ApiError.badRequest('Request body is not valid JSON');

    // Mongo is unreachable / the driver timed out selecting a server.
    } else if (
      error.name === 'MongoNetworkError' ||
      error.name === 'MongooseServerSelectionError' ||
      error.name === 'MongoServerSelectionError'
    ) {
      error = ApiError.serviceUnavailable('Database is temporarily unreachable. Please retry.');

    } else {
      error = new ApiError(error.statusCode || error.status || 500, error.message || 'Internal Server Error');
    }
  }

  // Only genuine faults belong in the error log; expected 4xx responses are
  // noise that hides real incidents.
  if (!error.expected) {
    console.error(`[error] ${req.method} ${req.originalUrl} ->`, err.stack || err);
  }

  const body = {
    success: false,
    message: error.message,
  };
  if (error.details) body.errors = error.details;
  // Stack traces leak internal paths and dependency versions; never in prod.
  if (!env.isProduction && error.stack) body.stack = error.stack;

  res.status(error.statusCode || 500).json(body);
};

module.exports = { notFound, errorHandler };
