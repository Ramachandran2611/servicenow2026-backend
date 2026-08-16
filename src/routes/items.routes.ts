import { FastifyInstance } from "fastify";
import * as itemsController from "../controllers/items.controller";

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

export default async function itemsRoutes(app: FastifyInstance) {
  app.post(
    "/items",
    { schema: createItemSchema, preHandler: app.authenticate },
    itemsController.createItem
  );

  app.get("/items", itemsController.listItems);

  app.get("/items/:id", { schema: idParamSchema }, itemsController.getItem);

  app.put(
    "/items/:id",
    { schema: replaceItemSchema, preHandler: app.authenticate },
    itemsController.replaceItem
  );

  app.patch(
    "/items/:id",
    { schema: patchItemSchema, preHandler: app.authenticate },
    itemsController.patchItem
  );

  app.delete(
    "/items/:id",
    { schema: idParamSchema, preHandler: app.authenticate },
    itemsController.deleteItem
  );
}
