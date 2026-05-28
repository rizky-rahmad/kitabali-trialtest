/**
 * utils/ApiError.js
 * A typed, HTTP-aware error. Throw these anywhere; the central error handler
 * turns them into consistent JSON responses. `isOperational` distinguishes
 * expected errors (bad input, auth) from genuine bugs.
 */
class ApiError extends Error {
  constructor(statusCode, message, details = undefined, { isOperational = true } = {}) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = isOperational;
    if (Error.captureStackTrace) Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, details) {
    return new ApiError(400, message, details);
  }
  static unauthorized(message = "Unauthorized") {
    return new ApiError(401, message);
  }
  static notFound(message = "Not found") {
    return new ApiError(404, message);
  }
  static internal(message = "Internal server error") {
    return new ApiError(500, message, undefined, { isOperational: false });
  }
}

module.exports = ApiError;
