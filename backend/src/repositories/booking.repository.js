import { query } from "../config/database.js";
import { COLUMNS } from "../models/booking.model.js";

const RETURNING = COLUMNS.join(", ");

export async function create(data) {
  const { rows } = await query(
    `INSERT INTO bookings (name, email, phone, booking_date, booking_time, guests, message)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING ${RETURNING}`,
    [data.name, data.email, data.phone??null, data.booking_date,
     data.booking_time??null, data.guests??null, data.message??null]
  );
  return rows[0];
}

export async function findAll() {
  const { rows } = await query(
    `SELECT ${RETURNING} FROM bookings ORDER BY created_at DESC`
  );
  return rows;
}

export async function findById(id) {
  const { rows } = await query(
    `SELECT ${RETURNING} FROM bookings WHERE id = $1`, [id]
  );
  return rows[0] ?? null;
}

export async function update(id, data) {
  // Build SET clause from only the keys provided (partial update)
  const fields = Object.keys(data).filter(k => data[k] !== undefined);
  if (fields.length === 0) return findById(id);
  const setClauses = fields.map((k, i) => `${k} = $${i + 2}`).join(", ");
  const values     = fields.map(k => data[k]);
  const { rows } = await query(
    `UPDATE bookings SET ${setClauses} WHERE id = $1 RETURNING ${RETURNING}`,
    [id, ...values]
  );
  return rows[0] ?? null;
}

export async function remove(id) {
  const { rows } = await query(
    `DELETE FROM bookings WHERE id = $1 RETURNING id`, [id]
  );
  return rows[0] ?? null;
}
