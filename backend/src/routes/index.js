/**
 * routes/index.js
 * Mounts every feature router under /api (applied by app.js).
 *   /api/bookings        -> booking.routes
 *   /api/admin/bookings  -> admin.routes
 *   /api/health          -> health.routes
 */
import express from "express";
import bookingRoutes from "./booking.routes.js";
import adminRoutes from "./admin.routes.js";
import healthRoutes from "./health.routes.js";

const { Router } = express;
const router = Router();

router.use("/bookings", bookingRoutes);
router.use("/admin", adminRoutes);
router.use("/health", healthRoutes);

export default router;
