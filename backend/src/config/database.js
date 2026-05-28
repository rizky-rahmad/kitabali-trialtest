/**
 * config/database.js
 * Single shared pg connection pool. Every repository imports `query` from here
 * so connection handling lives in exactly one place.
 */
import pg from "pg";
import config from "./env.js";
import logger from "../utils/logger.js";

const { Pool } = pg;

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

export const pool = new Pool({
  ...poolConfig,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on("error", (err) => {
  logger.error("Unexpected idle PostgreSQL client error", err);
});

/** Parameterized query helper. Always pass values via `params`. */
export const query = (text, params) => pool.query(text, params);
