/**
 * middleware/requestLogger.js
 * HTTP access logging. Pipes morgan output through our logger so all logs
 * share one format/destination.
 */
const morgan = require("morgan");
const logger = require("../utils/logger");
const config = require("../config/env");

const format = config.isProd ? "combined" : "dev";

module.exports = morgan(format, {
  stream: { write: (message) => logger.info(message.trim()) },
  skip: () => config.isTest,
});
