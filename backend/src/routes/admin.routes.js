const { Router } = require("express");
const { requireAdminKey } = require("../middleware/auth");
const adminController = require("../controllers/admin.controller");

const router = Router();

// GET /api/admin/bookings
router.get("/bookings", requireAdminKey, adminController.listBookings);

module.exports = router;
