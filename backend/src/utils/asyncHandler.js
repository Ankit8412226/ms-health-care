/**
 * Wraps an async route handler so a rejected promise reaches Express's error
 * middleware instead of hanging the request.
 *
 * Express 4 does not await handlers, so an async function that throws produces
 * an unhandled rejection and the client waits until it times out. Every async
 * controller in this codebase is wrapped with this.
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
