import * as itemsRepository from '../repositories/itemsRepository.js';
import { validateItem } from '../models/itemsModel.js';

export const getItems = async () => {
  try {
    const items = await itemsRepository.getItems();
    return items;
  } catch (error) {
    console.error('Error getting items', error);
    throw error;
  }
};

export const getItemById = async (id) => {
  try {
    const item = await itemsRepository.getItemById(id);
    if (!item) {
      throw { status: 404, message: `Item avec l'ID ${id} introuvable` };
    }
    return item;
  } catch (error) {
    console.error('Error getting item', error);
    throw error;
  }
};

export const createItem = async (data) => {
  try {
    const validation = validateItem(data);
    if (!validation.isValid) {
      throw { status: 400, message: validation.errors };
    }
    const item = await itemsRepository.createItem(data);
    return item;
  } catch (error) {
    console.error('Error creating item', error);
    throw error;
  }
};

export const updateItem = async (id, data) => {
  try {
    const existingItem = await itemsRepository.getItemById(id);
    if (!existingItem) {
      throw { status: 404, message: `Item avec l'ID ${id} introuvable` };
    }
    const validation = validateItem(data);
    if (!validation.isValid) {
      throw { status: 400, message: validation.errors };
    }
    const item = await itemsRepository.updateItem(id, data);
    return item;
  } catch (error) {
    console.error('Error updating item', error);
    throw error;
  }
};

export const deleteItem = async (id) => {
  try {
    const existingItem = await itemsRepository.getItemById(id);
    if (!existingItem) {
      throw { status: 404, message: `Item avec l'ID ${id} introuvable` };
    }

    const isUsedInRecipes = await itemsRepository.isItemUsedInRecipes(id);
    if (isUsedInRecipes) {
      throw {
        status: 400,
        message: `Impossible de supprimer l'item car il est utilisé dans des recettes`,
      };
    }
    const item = await itemsRepository.deleteItem(id);
    return item;
  } catch (error) {
    console.error('Error deleting item', error);
    throw error;
  }
};
