import "dotenv/config";
import Fastify, { FastifyRequest, FastifyReply } from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import bcrypt from "bcryptjs";
import { pool } from "./db";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

const app = Fastify({ logger: true });
const port = Number(process.env.PORT) || 3000;

app.register(cors);
app.register(jwt, { secret: process.env.JWT_SECRET as string });

app.decorate(
  "authenticate",
  async function (request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({ error: "Unauthorized — log in first" });
    }
  }
);

const authBodySchema = {
  body: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string", format: "email" },
      password: { type: "string", minLength: 6 },
    },
  },
};

app.post("/auth/register", { schema: authBodySchema }, async (request, reply) => {
  const { email, password } = request.body as { email: string; password: string };
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at",
      [email, passwordHash]
    );
    reply.code(201);
    return result.rows[0];
  } catch (err: any) {
    if (err.code === "23505") {
      reply.code(409);
      return { error: "An account with that email already exists" };
    }
    throw err;
  }
});

app.post("/auth/login", { schema: authBodySchema }, async (request, reply) => {
  const { email, password } = request.body as { email: string; password: string };
  const result = await pool.query(
    "SELECT id, email, password_hash FROM users WHERE email = $1",
    [email]
  );

  if (result.rows.length === 0) {
    reply.code(401);
    return { error: "Invalid email or password" };
  }

  const user = result.rows[0];
  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) {
    reply.code(401);
    return { error: "Invalid email or password" };
  }

  const token = app.jwt.sign({ id: user.id, email: user.email });
  return { token };
});

app.get("/health", async (request, reply) => {
  return { status: "ok" };
});

app.get("/health/db", async (request, reply) => {
  const result = await pool.query("SELECT NOW()");
  return { status: "ok", serverTime: result.rows[0].now };
});

const idParamSchema = {
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", pattern: "^[0-9]+$" },
    },
  },
};

const createItemSchema = {
  body: {
    type: "object",
    required: ["name"],
    properties: {
      name: { type: "string", minLength: 1 },
      description: { type: "string" },
    },
  },
};

const replaceItemSchema = {
  ...idParamSchema,
  body: createItemSchema.body,
};

const patchItemSchema = {
  ...idParamSchema,
  body: {
    type: "object",
    properties: {
      name: { type: "string", minLength: 1 },
      description: { type: "string" },
    },
  },
};

app.post("/items", { schema: createItemSchema, preHandler: app.authenticate }, async (request, reply) => {
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

app.get("/items/:id", { schema: idParamSchema }, async (request, reply) => {
  const { id } = request.params as { id: string };
  const result = await pool.query("SELECT * FROM items WHERE id = $1", [id]);
  if (result.rows.length === 0) {
    reply.code(404);
    return { error: "Item not found" };
  }
  return result.rows[0];
});

app.put("/items/:id", { schema: replaceItemSchema, preHandler: app.authenticate }, async (request, reply) => {
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

app.patch("/items/:id", { schema: patchItemSchema, preHandler: app.authenticate }, async (request, reply) => {
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

app.delete("/items/:id", { schema: idParamSchema, preHandler: app.authenticate }, async (request, reply) => {
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
