/**
 * controllers/health.controller.js
 * Liveness/readiness probe. Verifies the DB is reachable.
 */
import asyncHandler from "../utils/asyncHandler.js";
import { query } from "../config/database.js";

export const check = asyncHandler(async (_req, res) => {
  try {
    await query("SELECT 1");
    res.json({ status: "ok", time: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({
      status: "degraded",
      error: "database unavailable",
      time: new Date().toISOString(),
    });
  }
});
