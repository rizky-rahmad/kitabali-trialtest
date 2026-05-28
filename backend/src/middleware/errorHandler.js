/**
 * middleware/errorHandler.js
 * The single exit point for all errors. Produces a consistent JSON shape:
 *   { error: string, details?: string[] }
 * Operational errors (ApiError) surface their message; unexpected errors are
 * logged with a stack and hidden behind a generic message in production.
 */
import ApiError from "../utils/ApiError.js";
import logger from "../utils/logger.js";
import config from "../config/env.js";

// eslint-disable-next-line no-unused-vars
export default function errorHandler(err, req, res, _next) {
  const isApiError = err instanceof ApiError;
  const statusCode = isApiError ? err.statusCode : 500;

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
