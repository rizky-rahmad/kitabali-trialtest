import * as repo from "../repositories/booking.repository.js";
import { toPublic } from "../models/booking.model.js";
import ApiError from "../utils/ApiError.js";

function assertNotPast(dateStr) {
  const d = new Date(dateStr), today = new Date();
  today.setHours(0,0,0,0);
  if (d < today) throw ApiError.badRequest("Validation failed", ["booking_date cannot be in the past"]);
}

/** Public booking — enforces no-past-date rule */
export async function createBooking(input) {
  assertNotPast(input.booking_date);
  return toPublic(await repo.create(input));
}

/** Admin booking — no past-date restriction */
export async function adminCreateBooking(input) {
  return toPublic(await repo.create(input));
}

export async function listBookings() {
  return (await repo.findAll()).map(toPublic);
}

export async function updateBooking(id, input) {
  const existing = await repo.findById(id);
  if (!existing) throw ApiError.notFound(`Booking #${id} not found`);
  return toPublic(await repo.update(id, input));
}

export async function deleteBooking(id) {
  const existing = await repo.findById(id);
  if (!existing) throw ApiError.notFound(`Booking #${id} not found`);
  await repo.remove(id);
}
