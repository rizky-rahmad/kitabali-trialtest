/**
 * controllers/booking.controller.js
 * Thin HTTP layer: read validated input, call the service, shape the response.
 * No business logic, no SQL.
 */
const asyncHandler = require("../utils/asyncHandler");
const bookingService = require("../services/booking.service");

const create = asyncHandler(async (req, res) => {
  const booking = await bookingService.createBooking(req.validatedBody);
  res.status(201).json({ booking });
});

module.exports = { create };
