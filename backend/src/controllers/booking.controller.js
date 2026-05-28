/**
 * controllers/booking.controller.js
 * Thin HTTP layer: read validated input, call the service, shape the response.
 * No business logic, no SQL.
 */
import asyncHandler from "../utils/asyncHandler.js";
import * as bookingService from "../services/booking.service.js";

export const create = asyncHandler(async (req, res) => {
  const booking = await bookingService.createBooking(req.validatedBody);
  res.status(201).json({ booking });
});
