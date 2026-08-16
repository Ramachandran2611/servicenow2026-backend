import { FastifyRequest, FastifyReply } from "fastify";
import * as itemsService from "../services/items.service";

export async function createItem(request: FastifyRequest, reply: FastifyReply) {
  const { name, description } = request.body as {
    name: string;
    description?: string;
  };
  const item = await itemsService.createItem(name, description, request.user.id);
  reply.code(201);
  return item;
}

export async function listItems(request: FastifyRequest, reply: FastifyReply) {
  return itemsService.listItems();
}

export async function getItem(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  return itemsService.getItem(id);
}

export async function replaceItem(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const { name, description } = request.body as {
    name: string;
    description?: string;
  };
  return itemsService.replaceItem(id, name, description, request.user.id);
}

export async function patchItem(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const { name, description } = request.body as {
    name?: string;
    description?: string;
  };
  return itemsService.patchItem(id, name, description, request.user.id);
}

export async function deleteItem(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  await itemsService.deleteItem(id, request.user.id);
  reply.code(204);
}
