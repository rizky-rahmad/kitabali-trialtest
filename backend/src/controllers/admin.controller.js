import asyncHandler from "../utils/asyncHandler.js";
import * as svc from "../services/booking.service.js";

export const listBookings = asyncHandler(async (_req, res) => {
  const bookings = await svc.listBookings();
  res.json({ count: bookings.length, bookings });
});

export const createBooking = asyncHandler(async (req, res) => {
  const booking = await svc.adminCreateBooking(req.validatedBody);
  res.status(201).json({ booking });
});

export const updateBooking = asyncHandler(async (req, res) => {
  const booking = await svc.updateBooking(Number(req.params.id), req.validatedBody);
  res.json({ booking });
});

export const deleteBooking = asyncHandler(async (req, res) => {
  await svc.deleteBooking(Number(req.params.id));
  res.json({ message: "Booking deleted successfully" });
});
