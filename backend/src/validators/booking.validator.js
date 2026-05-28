/**
 * validators/booking.validator.js
 * Schema-level validation (shape, types, formats). Business rules that need
 * domain knowledge (e.g. "no past dates") live in the service, not here.
 *
 * The schema also normalizes input: trims strings, lowercases the email,
 * coerces `guests` to a number, and turns empty optionals into null.
 */
const { z } = require("zod");

const emptyToNull = (v) => (v === undefined || v === "" ? null : v);

const createBookingSchema = z.object({
  name: z
    .string({ required_error: "name is required" })
    .trim()
    .min(2, "name must be at least 2 characters")
    .max(120, "name is too long"),

  email: z
    .string({ required_error: "email is required" })
    .trim()
    .toLowerCase()
    .email("a valid email is required"),

  phone: z
    .string()
    .trim()
    .max(40, "phone is too long")
    .optional()
    .nullable()
    .transform(emptyToNull),

  booking_date: z
    .string({ required_error: "booking_date is required" })
    .refine((v) => !Number.isNaN(Date.parse(v)), "booking_date must be a valid date (YYYY-MM-DD)"),

  booking_time: z
    .string()
    .optional()
    .nullable()
    .transform(emptyToNull),

  guests: z.coerce
    .number({ invalid_type_error: "guests must be a number" })
    .int("guests must be a whole number")
    .positive("guests must be at least 1")
    .max(50, "guests must be 50 or fewer")
    .nullish(),

  message: z
    .string()
    .trim()
    .max(2000, "message is too long")
    .optional()
    .nullable()
    .transform(emptyToNull),
});

module.exports = { createBookingSchema };
