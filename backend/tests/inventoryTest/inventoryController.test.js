process.env.NODE_ENV = 'test';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as inventoryController from '../../src/controllers/inventoryController.js';
import * as inventoryService from '../../src/services/inventoryService.js';

vi.mock('../../src/services/inventoryService.js');

describe('Inventory Controller', () => {
  let req;
  let res;

  beforeEach(() => {
    vi.resetAllMocks();

    req = {
      params: {},
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
  });

  describe('getInventoryByUserId', () => {
    it("✅ doit retourner un status 200 avec l'inventaire de l'utilisateur", async () => {
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

      req.params.userId = '1';
      inventoryService.getInventoryByUserId.mockResolvedValue(mockInventory);

      await inventoryController.getInventoryByUserId(req, res);

      expect(inventoryService.getInventoryByUserId).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockInventory);
    });

    it("❌ doit retourner le status d'erreur et le message si le service lance une erreur", async () => {
      const mockError = {
        status: 404,
        message: "Inventaire pour l'utilisateur 999 introuvable",
      };

      req.params.userId = '999';
      inventoryService.getInventoryByUserId.mockRejectedValue(mockError);

      await inventoryController.getInventoryByUserId(req, res);

      expect(inventoryService.getInventoryByUserId).toHaveBeenCalledWith('999');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: mockError.message });
    });

    it('❌ doit retourner le status 500 si le service lance une erreur sans status', async () => {
      const mockError = new Error('Erreur interne');

      req.params.userId = '1';
      inventoryService.getInventoryByUserId.mockRejectedValue(mockError);

      await inventoryController.getInventoryByUserId(req, res);

      expect(inventoryService.getInventoryByUserId).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: mockError.message });
    });
  });
});
