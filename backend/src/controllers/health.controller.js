/**
 * controllers/health.controller.js
 * Liveness/readiness probe. Verifies the DB is reachable.
 */
const asyncHandler = require("../utils/asyncHandler");
const db = require("../config/database");

const check = asyncHandler(async (_req, res) => {
  try {
    await db.query("SELECT 1");
    res.json({ status: "ok", time: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({
      status: "degraded",
      error: "database unavailable",
      time: new Date().toISOString(),
    });
  }
});

module.exports = { check };
