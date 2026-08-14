import "dotenv/config";
import Fastify from "fastify";

const app = Fastify({ logger: true });
const port = Number(process.env.PORT) || 3000;

app.get("/health", async (request, reply) => {
  return { status: "ok" };
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
