/**
 * models/booking.model.js
 * The single source of truth for the booking's persisted columns and its
 * public (API) representation. Keeping serialization here means we control
 * exactly what leaves the system from one place.
 */
export const COLUMNS = [
  "id",
  "name",
  "email",
  "phone",
  "booking_date",
  "booking_time",
  "guests",
  "message",
  "status",
  "created_at",
];

/** Map a raw DB row to the shape returned by the API. */
export function toPublic(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    booking_date: row.booking_date,
    booking_time: row.booking_time,
    guests: row.guests,
    message: row.message,
    status: row.status,
    created_at: row.created_at,
  };
}
