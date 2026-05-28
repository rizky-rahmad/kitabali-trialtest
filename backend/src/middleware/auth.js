/**
 * middleware/auth.js
 * Guards admin routes with a shared-secret header (x-admin-key).
 * For production this should become a real session/JWT scheme.
 */
import ApiError from "../utils/ApiError.js";
import config from "../config/env.js";

export function requireAdminKey(req, _res, next) {
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
