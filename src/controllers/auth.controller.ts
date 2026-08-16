import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import * as authService from "../services/auth.service";

export function makeAuthController(app: FastifyInstance) {
  return {
    async register(request: FastifyRequest, reply: FastifyReply) {
      const { email, password } = request.body as {
        email: string;
        password: string;
      };
      try {
        const user = await authService.registerUser(email, password);
        reply.code(201);
        return user;
      } catch (err) {
        if (err instanceof authService.DuplicateEmailError) {
          reply.code(409);
          return { error: err.message };
        }
        throw err;
      }
    },

    async login(request: FastifyRequest, reply: FastifyReply) {
      const { email, password } = request.body as {
        email: string;
        password: string;
      };
      try {
        const user = await authService.verifyCredentials(email, password);
        const token = app.jwt.sign({ id: user.id, email: user.email });
        return { token };
      } catch (err) {
        if (err instanceof authService.InvalidCredentialsError) {
          reply.code(401);
          return { error: err.message };
        }
        throw err;
      }
    },
  };
}
