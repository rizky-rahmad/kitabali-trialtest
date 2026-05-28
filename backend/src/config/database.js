/**
 * config/database.js
 * Single shared pg connection pool. Every repository imports `query` from here
 * so connection handling lives in exactly one place.
 */
const { Pool } = require("pg");
const config = require("./env");
const logger = require("../utils/logger");

const poolConfig = config.DATABASE_URL
  ? {
      connectionString: config.DATABASE_URL,
      ssl: config.pgSsl ? { rejectUnauthorized: false } : false,
    }
  : {
      host: config.PGHOST || "localhost",
      port: config.PGPORT || 5432,
      user: config.PGUSER || "postgres",
      password: config.PGPASSWORD || "postgres",
      database: config.PGDATABASE || "bookings_db",
    };

const pool = new Pool({
  ...poolConfig,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on("error", (err) => {
  // An idle client errored — log and let the pool recover.
  logger.error("Unexpected idle PostgreSQL client error", err);
});

module.exports = {
  pool,
  /** Parameterized query helper. Always pass values via `params`. */
  query: (text, params) => pool.query(text, params),
};
