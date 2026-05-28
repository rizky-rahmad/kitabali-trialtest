/**
 * repositories/booking.repository.js
 * Data-access layer. The ONLY place that knows SQL for bookings.
 * No business logic, no HTTP — just persistence. All queries are parameterized.
 */
const db = require("../config/database");
const { COLUMNS } = require("../models/booking.model");

const RETURNING = COLUMNS.join(", ");

async function create(data) {
  const text = `
    INSERT INTO bookings (name, email, phone, booking_date, booking_time, guests, message)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING ${RETURNING}
  `;
  const params = [
    data.name,
    data.email,
    data.phone ?? null,
    data.booking_date,
    data.booking_time ?? null,
    data.guests ?? null,
    data.message ?? null,
  ];
  const { rows } = await db.query(text, params);
  return rows[0];
}

async function findAll() {
  const { rows } = await db.query(
    `SELECT ${RETURNING} FROM bookings ORDER BY created_at DESC`
  );
  return rows;
}

module.exports = { create, findAll };
