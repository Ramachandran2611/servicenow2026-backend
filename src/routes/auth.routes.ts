import { FastifyInstance } from "fastify";
import { makeAuthController } from "../controllers/auth.controller";

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

export default async function authRoutes(app: FastifyInstance) {
  const controller = makeAuthController(app);

  app.post("/auth/register", { schema: authBodySchema }, controller.register);
  app.post("/auth/login", { schema: authBodySchema }, controller.login);
}
