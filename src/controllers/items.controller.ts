import { FastifyRequest, FastifyReply } from "fastify";
import * as itemsService from "../services/items.service";

export async function createItem(request: FastifyRequest, reply: FastifyReply) {
  const { name, description } = request.body as {
    name: string;
    description?: string;
  };
  const item = await itemsService.createItem(name, description);
  reply.code(201);
  return item;
}

export async function listItems(request: FastifyRequest, reply: FastifyReply) {
  return itemsService.listItems();
}

export async function getItem(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const item = await itemsService.getItem(id);
  if (!item) {
    reply.code(404);
    return { error: "Item not found" };
  }
  return item;
}

export async function replaceItem(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const { name, description } = request.body as {
    name: string;
    description?: string;
  };
  const item = await itemsService.replaceItem(id, name, description);
  if (!item) {
    reply.code(404);
    return { error: "Item not found" };
  }
  return item;
}

export async function patchItem(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const { name, description } = request.body as {
    name?: string;
    description?: string;
  };
  const item = await itemsService.patchItem(id, name, description);
  if (!item) {
    reply.code(404);
    return { error: "Item not found" };
  }
  return item;
}

export async function deleteItem(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const item = await itemsService.deleteItem(id);
  if (!item) {
    reply.code(404);
    return { error: "Item not found" };
  }
  reply.code(204);
}
