/**
 * middleware/validate.js
 * Runs a zod schema against req.body. On success, the parsed+normalized value
 * is attached to req.validatedBody. On failure, a 400 with a `details[]` array
 * is forwarded to the error handler.
 */
const ApiError = require("../utils/ApiError");

const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const details = result.error.issues.map((issue) => {
      const path = issue.path.join(".");
      return path ? `${path}: ${issue.message}` : issue.message;
    });
    return next(ApiError.badRequest("Validation failed", details));
  }
  req.validatedBody = result.data;
  next();
};

module.exports = validate;
