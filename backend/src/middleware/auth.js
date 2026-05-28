/**
 * middleware/auth.js
 * Guards admin routes with a shared-secret header (x-admin-key).
 * For production this should become a real session/JWT scheme.
 */
const ApiError = require("../utils/ApiError");
const config = require("../config/env");

function requireAdminKey(req, _res, next) {
  // env.js guarantees ADMIN_KEY exists, but guard defensively anyway.
  if (!config.ADMIN_KEY) {
    return next(ApiError.internal("ADMIN_KEY is not configured"));
  }
  const provided = req.get("x-admin-key");
  if (!provided || provided !== config.ADMIN_KEY) {
    return next(ApiError.unauthorized("Invalid admin key"));
  }
  next();
}

module.exports = { requireAdminKey };
