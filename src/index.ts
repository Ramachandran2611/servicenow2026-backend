import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import { pool } from "./db";
import { registerAuthenticate } from "./middleware/authenticate";
import authRoutes from "./routes/auth.routes";
import itemsRoutes from "./routes/items.routes";
import {
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
} from "./errors";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: any, reply: any) => Promise<void>;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { id: number; email: string };
    user: { id: number; email: string };
  }
}

const app = Fastify({ logger: true });
const port = Number(process.env.PORT) || 3000;

app.register(cors);
app.register(jwt, { secret: process.env.JWT_SECRET as string });
registerAuthenticate(app);

app.get("/health", async (request, reply) => {
  return { status: "ok" };
});

app.get("/health/db", async (request, reply) => {
  const result = await pool.query("SELECT NOW()");
  return { status: "ok", serverTime: result.rows[0].now };
});

app.register(authRoutes);
app.register(itemsRoutes);

// Global error handler — every thrown error and every Fastify-level failure
// (schema validation, malformed body) ends up here, mapped to one consistent
// { error: "..." } response shape and the correct status code.
app.setErrorHandler((error, request, reply) => {
  if (error.validation) {
    reply.code(422).send({ error: error.message });
    return;
  }
  if (error instanceof UnauthorizedError) {
    reply.code(401).send({ error: error.message });
    return;
  }
  if (error instanceof ForbiddenError) {
    reply.code(403).send({ error: error.message });
    return;
  }
  if (error instanceof NotFoundError) {
    reply.code(404).send({ error: error.message });
    return;
  }
  if (error instanceof ConflictError) {
    reply.code(409).send({ error: error.message });
    return;
  }
  if (error.statusCode && error.statusCode < 500) {
    reply.code(error.statusCode).send({ error: error.message });
    return;
  }

  request.log.error(error);
  reply.code(500).send({ error: "Internal Server Error" });
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
