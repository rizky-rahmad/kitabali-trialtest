/**
 * middleware/requestLogger.js
 * HTTP access logging. Pipes morgan output through our logger so all logs
 * share one format/destination.
 */
import morgan from "morgan";
import logger from "../utils/logger.js";
import config from "../config/env.js";

const format = config.isProd ? "combined" : "dev";

const requestLogger = morgan(format, {
  stream: { write: (message) => logger.info(message.trim()) },
  skip: () => config.isTest,
});

export default requestLogger;
