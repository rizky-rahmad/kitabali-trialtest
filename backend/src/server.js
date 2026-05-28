/**
 * server.js
 * Process entry point: starts the HTTP server and wires graceful shutdown.
 */
import app from "./app.js";
import config from "./config/env.js";
import logger from "./utils/logger.js";
import { pool } from "./config/database.js";

const server = app.listen(config.PORT, () => {
  logger.info(`Bookings API listening on http://localhost:${config.PORT} [${config.NODE_ENV}]`);
});

function shutdown(signal) {
  logger.info(`${signal} received — shutting down gracefully...`);
  server.close(async () => {
    try {
      await pool.end();
      logger.info("HTTP server and DB pool closed. Bye.");
      process.exit(0);
    } catch (err) {
      logger.error("Error during shutdown", err);
      process.exit(1);
    }
  });
  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled promise rejection", reason);
});

export default server;
