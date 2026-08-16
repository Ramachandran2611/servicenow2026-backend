import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { pool } from "./db";

const app = Fastify({ logger: true });
const port = Number(process.env.PORT) || 3000;

app.register(cors);

app.get("/health", async (request, reply) => {
  return { status: "ok" };
});

app.get("/health/db", async (request, reply) => {
  const result = await pool.query("SELECT NOW()");
  return { status: "ok", serverTime: result.rows[0].now };
});

app.post("/items", async (request, reply) => {
  const { name, description } = request.body as {
    name: string;
    description?: string;
  };
  const result = await pool.query(
    "INSERT INTO items (name, description) VALUES ($1, $2) RETURNING *",
    [name, description ?? null]
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
  const { name, description } = request.body as {
    name: string;
    description?: string;
  };
  const result = await pool.query(
    "UPDATE items SET name = $1, description = $2 WHERE id = $3 RETURNING *",
    [name, description ?? null, id]
  );
  if (result.rows.length === 0) {
    reply.code(404);
    return { error: "Item not found" };
  }
  return result.rows[0];
});

app.patch("/items/:id", async (request, reply) => {
  const { id } = request.params as { id: string };
  const { name, description } = request.body as {
    name?: string;
    description?: string;
  };
  const result = await pool.query(
    "UPDATE items SET name = COALESCE($1, name), description = COALESCE($2, description) WHERE id = $3 RETURNING *",
    [name ?? null, description ?? null, id]
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
