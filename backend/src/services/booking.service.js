/**
 * services/booking.service.js
 * Business logic + orchestration. Talks to repositories, applies domain rules,
 * returns API-ready data. Knows nothing about Express (no req/res).
 */
const bookingRepository = require("../repositories/booking.repository");
const { toPublic } = require("../models/booking.model");
const ApiError = require("../utils/ApiError");

/** Domain rule: a booking date may not be in the past. */
function assertDateNotInPast(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date < today) {
    throw ApiError.badRequest("Validation failed", ["booking_date cannot be in the past"]);
  }
}

async function createBooking(input) {
  assertDateNotInPast(input.booking_date);
  const row = await bookingRepository.create(input);
  return toPublic(row);
}

async function listBookings() {
  const rows = await bookingRepository.findAll();
  return rows.map(toPublic);
}

module.exports = { createBooking, listBookings };
