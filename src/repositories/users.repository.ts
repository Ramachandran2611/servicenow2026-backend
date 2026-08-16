import { pool } from "../db";

export async function insertUser(email: string, passwordHash: string) {
  const result = await pool.query(
    "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at",
    [email, passwordHash]
  );
  return result.rows[0];
}

export async function findUserByEmail(email: string) {
  const result = await pool.query(
    "SELECT id, email, password_hash FROM users WHERE email = $1",
    [email]
  );
  return result.rows[0] ?? null;
}
