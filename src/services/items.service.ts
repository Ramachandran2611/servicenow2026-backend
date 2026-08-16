import * as itemsRepository from "../repositories/items.repository";
import { NotFoundError, ForbiddenError } from "../errors";

async function assertModifiable(id: string, requestingUserId: number) {
  const existing = await itemsRepository.findItemById(id);
  if (!existing) {
    throw new NotFoundError("Item not found");
  }
  if (existing.created_by !== null && existing.created_by !== requestingUserId) {
    throw new ForbiddenError("You do not have permission to modify this item");
  }
}

export async function createItem(
  name: string,
  description: string | undefined,
  createdBy: number
) {
  return itemsRepository.insertItem(name, description ?? null, createdBy);
}

export async function listItems() {
  return itemsRepository.findAllItems();
}

export async function getItem(id: string) {
  const item = await itemsRepository.findItemById(id);
  if (!item) {
    throw new NotFoundError("Item not found");
  }
  return item;
}

export async function replaceItem(
  id: string,
  name: string,
  description: string | undefined,
  requestingUserId: number
) {
  await assertModifiable(id, requestingUserId);
  return itemsRepository.replaceItem(id, name, description ?? null);
}

export async function patchItem(
  id: string,
  name: string | undefined,
  description: string | undefined,
  requestingUserId: number
) {
  await assertModifiable(id, requestingUserId);
  return itemsRepository.patchItem(id, name ?? null, description ?? null);
}

export async function deleteItem(id: string, requestingUserId: number) {
  await assertModifiable(id, requestingUserId);
  return itemsRepository.deleteItem(id);
}
