/**
 * middleware/notFound.js
 * Converts unmatched routes into a 404 ApiError so they flow through the
 * same response format as everything else.
 */
const ApiError = require("../utils/ApiError");

module.exports = (req, _res, next) =>
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
