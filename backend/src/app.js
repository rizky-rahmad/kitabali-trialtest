/**
 * app.js
 * Builds and configures the Express application. Kept separate from server.js
 * so it can be imported by tests (e.g. supertest) without binding a port.
 */
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");

const config = require("./config/env");
const requestLogger = require("./middleware/requestLogger");
const { apiLimiter, bookingLimiter } = require("./middleware/rateLimiter");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");
const apiRoutes = require("./routes");

const app = express();

// Behind Cloudflare Tunnel — trust forwarded headers (correct client IP, proto).
app.set("trust proxy", 1);

// Security headers
app.use(helmet());

// CORS — restricted to configured origins (or "*" in dev)
app.use(
  cors({
    origin: config.corsOrigins.includes("*") ? true : config.corsOrigins,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "x-admin-key"],
  })
);

// Body parsing
app.use(express.json({ limit: "100kb" }));

// Access logs
app.use(requestLogger);

// Rate limiting (stricter on the public booking endpoint)
app.use("/api", apiLimiter);
app.use("/api/bookings", bookingLimiter);

// Feature routes
app.use("/api", apiRoutes);

// 404 + centralized error handling (must be registered last)
app.use(notFound);
app.use(errorHandler);

module.exports = app;
