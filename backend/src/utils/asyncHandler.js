/**
 * utils/asyncHandler.js
 * Wraps async controllers so rejected promises are forwarded to Express's
 * error middleware instead of crashing the process.
 */
export default (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
