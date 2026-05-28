/**
 * utils/logger.js
 * Minimal leveled logger. Honors LOG_LEVEL and timestamps every line.
 * Swap for pino/winston later without touching call sites.
 */
const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const current = LEVELS[process.env.LOG_LEVEL] ?? LEVELS.info;

function write(level, msg, meta) {
  if (LEVELS[level] > current) return;
  const line = `[${new Date().toISOString()}] ${level.toUpperCase()} ${msg}`;
  const out = level === "error" || level === "warn" ? console.error : console.log;
  if (meta instanceof Error) out(line, "\n", meta.stack || meta.message);
  else if (meta !== undefined) out(line, meta);
  else out(line);
}

const logger = {
  error: (msg, meta) => write("error", msg, meta),
  warn: (msg, meta) => write("warn", msg, meta),
  info: (msg, meta) => write("info", msg, meta),
  debug: (msg, meta) => write("debug", msg, meta),
};

export default logger;
