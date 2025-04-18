process.env.NODE_ENV = 'test';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as inventoryService from '../../src/services/inventoryService.js';
import * as inventoryRepository from '../../src/repositories/inventoryRepository.js';

vi.mock('../../src/repositories/inventoryRepository.js');

describe('Inventory Service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getInventoryByUserId', () => {
    it("✅ doit retourner l'inventaire d'un utilisateur existant", async () => {
      const mockInventory = [
        {
          ID_Inventory: 1,
          ID_User: 1,
          ID_Item: 1,
          Name: 'Stone',
          Image_Path: 'images/items/stone.png',
          Quantity: 10,
        },
      ];

      inventoryRepository.getInventoryByUserId.mockResolvedValue(mockInventory);

      const result = await inventoryService.getInventoryByUserId(1);

      expect(inventoryRepository.getInventoryByUserId).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockInventory);
    });

    it("❌ doit lancer une erreur 404 si l'inventaire est vide", async () => {
      inventoryRepository.getInventoryByUserId.mockResolvedValue(null);

      await expect(inventoryService.getInventoryByUserId(999)).rejects.toEqual({
        status: 404,
        message: "Inventaire pour l'utilisateur 999 introuvable",
      });

      expect(inventoryRepository.getInventoryByUserId).toHaveBeenCalledWith(
        999
      );
    });

    it('❌ doit propager les erreurs du repository', async () => {
      const mockError = new Error('Database error');
      inventoryRepository.getInventoryByUserId.mockRejectedValue(mockError);

      await expect(inventoryService.getInventoryByUserId(1)).rejects.toThrow(
        mockError
      );

      expect(inventoryRepository.getInventoryByUserId).toHaveBeenCalledWith(1);
    });
  });
});
