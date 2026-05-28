/**
 * middleware/rateLimiter.js
 * Two limiters: a generous global one for the whole API, and a stricter one
 * for the public booking endpoint to deter spam/abuse.
 */
import rateLimit from "express-rate-limit";
import config from "../config/env.js";

export const apiLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

export const bookingLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.BOOKING_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many booking attempts, please try again later." },
});
