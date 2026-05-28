import express from "express";
import validate from "../middleware/validate.js";
import { createBookingSchema } from "../validators/booking.validator.js";
import * as bookingController from "../controllers/booking.controller.js";

const { Router } = express;
const router = Router();

// POST /api/bookings
router.post("/", validate(createBookingSchema), bookingController.create);

export default router;
