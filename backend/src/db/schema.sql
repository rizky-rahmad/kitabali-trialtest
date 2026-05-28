-- THIS IS BALI — bookings schema
-- Applied by `npm run migrate`, or manually:
--   psql "$DATABASE_URL" -f src/db/schema.sql

CREATE TABLE IF NOT EXISTS bookings (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(120)  NOT NULL,
  email        VARCHAR(255)  NOT NULL,
  phone        VARCHAR(40),
  booking_date DATE          NOT NULL,
  booking_time TIME,
  guests       INTEGER       CHECK (guests IS NULL OR guests > 0),
  message      TEXT,
  status       VARCHAR(20)   NOT NULL DEFAULT 'pending',
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- The admin list orders by created_at DESC, so index it.
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings (created_at DESC);
