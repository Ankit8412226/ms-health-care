/**
 * An error carrying an HTTP status code.
 *
 * Throwing one of these from a controller lets the central error handler build
 * the response, so controllers never repeat try/catch + res.status boilerplate.
 */
class ApiError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    // `expected` marks errors that are part of normal operation (a 404, a
    // validation failure). The error handler keeps these out of the error log.
    this.expected = statusCode < 500;
    if (details) this.details = details;
    Error.captureStackTrace(this, ApiError);
  }

  static badRequest(message, details) {
    return new ApiError(400, message, details);
  }

  static unauthorized(message = 'Not authorized') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Access denied') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, message);
  }

  static conflict(message, details) {
    return new ApiError(409, message, details);
  }

  static payloadTooLarge(message = 'Request payload too large') {
    return new ApiError(413, message);
  }

  static tooManyRequests(message = 'Too many requests') {
    return new ApiError(429, message);
  }

  static serviceUnavailable(message = 'Service temporarily unavailable') {
    return new ApiError(503, message);
  }
}

module.exports = ApiError;
