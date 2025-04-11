import * as inventoryRepository from '../repositories/inventoryRepository.js';

export const getInventoryByUserId = async (userId) => {
  try {
    const inventory = await inventoryRepository.getInventoryByUserId(userId);
    if (!inventory) {
      throw {
        status: 404,
        message: `Inventaire pour l'utilisateur ${userId} introuvable`,
      };
    }
    return inventory;
  } catch (error) {
    console.error('Error getting inventory', error);
    throw error;
  }
};
