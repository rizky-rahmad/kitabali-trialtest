/**
 * routes/index.js
 * Mounts every feature router under /api (applied by app.js).
 *   /api/bookings        -> booking.routes
 *   /api/admin/bookings  -> admin.routes
 *   /api/health          -> health.routes
 */
const { Router } = require("express");
const bookingRoutes = require("./booking.routes");
const adminRoutes = require("./admin.routes");
const healthRoutes = require("./health.routes");

const router = Router();

router.use("/bookings", bookingRoutes);
router.use("/admin", adminRoutes);
router.use("/health", healthRoutes);

module.exports = router;
