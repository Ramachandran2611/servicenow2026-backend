import "dotenv/config";
import Fastify from "fastify";
import { pool } from "./db";

const app = Fastify({ logger: true });
const port = Number(process.env.PORT) || 3000;

app.get("/health", async (request, reply) => {
  return { status: "ok" };
});

app.get("/health/db", async (request, reply) => {
  const result = await pool.query("SELECT NOW()");
  return { status: "ok", serverTime: result.rows[0].now };
});

app.post("/items", async (request, reply) => {
  const { name } = request.body as { name: string };
  const result = await pool.query(
    "INSERT INTO items (name) VALUES ($1) RETURNING *",
    [name]
  );
  reply.code(201);
  return result.rows[0];
});

app.get("/items", async (request, reply) => {
  const result = await pool.query("SELECT * FROM items ORDER BY id");
  return result.rows;
});

app.get("/items/:id", async (request, reply) => {
  const { id } = request.params as { id: string };
  const result = await pool.query("SELECT * FROM items WHERE id = $1", [id]);
  if (result.rows.length === 0) {
    reply.code(404);
    return { error: "Item not found" };
  }
  return result.rows[0];
});

app.put("/items/:id", async (request, reply) => {
  const { id } = request.params as { id: string };
  const { name } = request.body as { name: string };
  const result = await pool.query(
    "UPDATE items SET name = $1 WHERE id = $2 RETURNING *",
    [name, id]
  );
  if (result.rows.length === 0) {
    reply.code(404);
    return { error: "Item not found" };
  }
  return result.rows[0];
});

app.delete("/items/:id", async (request, reply) => {
  const { id } = request.params as { id: string };
  const result = await pool.query(
    "DELETE FROM items WHERE id = $1 RETURNING *",
    [id]
  );
  if (result.rows.length === 0) {
    reply.code(404);
    return { error: "Item not found" };
  }
  reply.code(204);
});

const start = async () => {
  try {
    await app.listen({ port });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
