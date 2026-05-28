/**
 * middleware/errorHandler.js
 * The single exit point for all errors. Produces a consistent JSON shape:
 *   { error: string, details?: string[] }
 * Operational errors (ApiError) surface their message; unexpected errors are
 * logged with a stack and hidden behind a generic message in production.
 */
const ApiError = require("../utils/ApiError");
const logger = require("../utils/logger");
const config = require("../config/env");

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  const isApiError = err instanceof ApiError;
  const statusCode = isApiError ? err.statusCode : 500;

  // Log server errors and anything non-operational with full detail.
  if (statusCode >= 500 || !isApiError || !err.isOperational) {
    logger.error(`${req.method} ${req.originalUrl} -> ${statusCode}`, err);
  }

  const body = {
    error:
      statusCode >= 500 && config.isProd
        ? "Internal server error"
        : err.message || "Error",
  };
  if (isApiError && err.details) body.details = err.details;

  res.status(statusCode).json(body);
}

module.exports = errorHandler;
