/**
 * config/env.js
 * Loads and validates environment variables once, at startup.
 * If anything required is missing/invalid, the process exits immediately
 * with a clear message instead of failing mysteriously later.
 */
require("dotenv").config();
const { z } = require("zod");

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),

  // Database: either a full URL, or discrete PG* vars (URL takes precedence)
  DATABASE_URL: z.string().min(1).optional(),
  PGHOST: z.string().optional(),
  PGPORT: z.coerce.number().optional(),
  PGUSER: z.string().optional(),
  PGPASSWORD: z.string().optional(),
  PGDATABASE: z.string().optional(),
  PGSSL: z.enum(["true", "false"]).default("false"),

  // Auth + CORS
  ADMIN_KEY: z.string().min(1, "ADMIN_KEY is required"),
  CORS_ORIGINS: z.string().default("*"),

  // Observability + limits
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  BOOKING_RATE_LIMIT_MAX: z.coerce.number().default(10),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
    .join("\n");
  // eslint-disable-next-line no-console
  console.error(`\n✖ Invalid environment configuration:\n${issues}\n`);
  process.exit(1);
}

const env = parsed.data;

module.exports = {
  ...env,
  isProd: env.NODE_ENV === "production",
  isTest: env.NODE_ENV === "test",
  corsOrigins: env.CORS_ORIGINS.split(",").map((s) => s.trim()).filter(Boolean),
  pgSsl: env.PGSSL === "true",
};
