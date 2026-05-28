/**
 * app.js
 * Builds and configures the Express application. Kept separate from server.js
 * so it can be imported by tests (e.g. supertest) without binding a port.
 */
import express from "express";
import helmet from "helmet";
import cors from "cors";

import config from "./config/env.js";
import requestLogger from "./middleware/requestLogger.js";
import { apiLimiter, bookingLimiter } from "./middleware/rateLimiter.js";
import notFound from "./middleware/notFound.js";
import errorHandler from "./middleware/errorHandler.js";
import apiRoutes from "./routes/index.js";

const app = express();

// Behind Cloudflare Tunnel — trust forwarded headers (correct client IP, proto).
app.set("trust proxy", 1);

// Security headers
app.use(helmet());

// CORS — restricted to configured origins (or "*" in dev)
app.use(
  cors({
    origin: config.corsOrigins.includes("*") ? true : config.corsOrigins,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-admin-key"],
  }),
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

export default app;
