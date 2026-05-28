import express from "express";
import { requireAdminKey } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { createBookingSchema, updateBookingSchema } from "../validators/booking.validator.js";
import * as ctrl from "../controllers/admin.controller.js";

const { Router } = express;
const router = Router();

router.get   ("/bookings",     requireAdminKey,                                  ctrl.listBookings);
router.post  ("/bookings",     requireAdminKey, validate(createBookingSchema),   ctrl.createBooking);
router.patch ("/bookings/:id", requireAdminKey, validate(updateBookingSchema),   ctrl.updateBooking);
router.delete("/bookings/:id", requireAdminKey,                                  ctrl.deleteBooking);

export default router;
