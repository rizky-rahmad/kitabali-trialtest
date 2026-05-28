import { z } from "zod";

const emptyToNull = (v) => (v === undefined || v === "" ? null : v);

export const createBookingSchema = z.object({
  name:         z.string({ required_error: "name is required" }).trim().min(2).max(120),
  email:        z.string({ required_error: "email is required" }).trim().toLowerCase().email(),
  phone:        z.string().trim().max(40).optional().nullable().transform(emptyToNull),
  booking_date: z.string({ required_error: "booking_date is required" })
                 .refine(v => !Number.isNaN(Date.parse(v)), "invalid date"),
  booking_time: z.string().optional().nullable().transform(emptyToNull),
  guests:       z.coerce.number().int().positive().max(50).nullish(),
  message:      z.string().trim().max(2000).optional().nullable().transform(emptyToNull),
});

// Admin update — all fields optional, plus status
export const updateBookingSchema = createBookingSchema
  .extend({ status: z.enum(["pending","confirmed","cancelled"]).optional() })
  .partial();
