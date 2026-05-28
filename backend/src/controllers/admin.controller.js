/**
 * controllers/admin.controller.js
 * Admin-facing read endpoints.
 */
const asyncHandler = require("../utils/asyncHandler");
const bookingService = require("../services/booking.service");

const listBookings = asyncHandler(async (_req, res) => {
  const bookings = await bookingService.listBookings();
  res.json({ count: bookings.length, bookings });
});

module.exports = { listBookings };
