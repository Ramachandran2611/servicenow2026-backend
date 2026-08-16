import * as itemsRepository from "../repositories/items.repository";

export async function createItem(name: string, description?: string) {
  return itemsRepository.insertItem(name, description ?? null);
}

export async function listItems() {
  return itemsRepository.findAllItems();
}

export async function getItem(id: string) {
  return itemsRepository.findItemById(id);
}

export async function replaceItem(
  id: string,
  name: string,
  description?: string
) {
  return itemsRepository.replaceItem(id, name, description ?? null);
}

export async function patchItem(
  id: string,
  name?: string,
  description?: string
) {
  return itemsRepository.patchItem(id, name ?? null, description ?? null);
}

export async function deleteItem(id: string) {
  return itemsRepository.deleteItem(id);
}
