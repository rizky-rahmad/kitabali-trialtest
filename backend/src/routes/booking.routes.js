const { Router } = require("express");
const validate = require("../middleware/validate");
const { createBookingSchema } = require("../validators/booking.validator");
const bookingController = require("../controllers/booking.controller");

const router = Router();

// POST /api/bookings
router.post("/", validate(createBookingSchema), bookingController.create);

module.exports = router;
