import { pool } from "../db";

export async function insertItem(
  name: string,
  description: string | null,
  createdBy: number
) {
  const result = await pool.query(
    "INSERT INTO items (name, description, created_by) VALUES ($1, $2, $3) RETURNING *",
    [name, description, createdBy]
  );
  return result.rows[0];
}

export async function findAllItems() {
  const result = await pool.query("SELECT * FROM items ORDER BY id");
  return result.rows;
}

export async function findItemById(id: string) {
  const result = await pool.query("SELECT * FROM items WHERE id = $1", [id]);
  return result.rows[0] ?? null;
}

export async function replaceItem(
  id: string,
  name: string,
  description: string | null
) {
  const result = await pool.query(
    "UPDATE items SET name = $1, description = $2 WHERE id = $3 RETURNING *",
    [name, description, id]
  );
  return result.rows[0] ?? null;
}

export async function patchItem(
  id: string,
  name: string | null,
  description: string | null
) {
  const result = await pool.query(
    "UPDATE items SET name = COALESCE($1, name), description = COALESCE($2, description) WHERE id = $3 RETURNING *",
    [name, description, id]
  );
  return result.rows[0] ?? null;
}

export async function deleteItem(id: string) {
  const result = await pool.query(
    "DELETE FROM items WHERE id = $1 RETURNING *",
    [id]
  );
  return result.rows[0] ?? null;
}
