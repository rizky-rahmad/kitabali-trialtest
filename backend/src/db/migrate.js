/**
 * db/migrate.js
 * Applies schema.sql. Idempotent (uses IF NOT EXISTS), so it's safe to re-run.
 * Usage: npm run migrate
 */
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { pool } from "../config/database.js";
import logger from "../utils/logger.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function migrate() {
  const sql = readFileSync(join(__dirname, "schema.sql"), "utf8");
  await pool.query(sql);
  logger.info("Migration complete: schema applied.");
}

migrate()
  .catch((err) => {
    logger.error("Migration failed", err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
