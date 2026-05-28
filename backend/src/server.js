/**
 * server.js
 * Process entry point: starts the HTTP server and wires graceful shutdown.
 */
const app = require("./app");
const config = require("./config/env");
const logger = require("./utils/logger");
const { pool } = require("./config/database");

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
  // Don't hang forever if something refuses to close.
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

module.exports = server;
