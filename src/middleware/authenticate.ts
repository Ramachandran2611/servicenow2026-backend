import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

export function registerAuthenticate(app: FastifyInstance) {
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
}
