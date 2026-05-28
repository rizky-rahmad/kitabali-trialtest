/**
 * db/migrate.js
 * Applies schema.sql. Idempotent (uses IF NOT EXISTS), so it's safe to re-run.
 * Usage: npm run migrate
 */
const fs = require("fs");
const path = require("path");
const { pool } = require("../config/database");
const logger = require("../utils/logger");

async function migrate() {
  const sql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  await pool.query(sql);
  logger.info("Migration complete: schema applied.");
}

migrate()
  .catch((err) => {
    logger.error("Migration failed", err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
