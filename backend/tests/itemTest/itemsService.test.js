process.env.NODE_ENV = 'test';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as itemService from '../../src/services/itemsService.js';
import * as itemRepository from '../../src/repositories/itemsRepository.js';
import { validateItem } from '../../src/models/itemsModel.js';

// Correction du chemin d'importation et mock complet
vi.mock('../../src/repositories/itemsRepository.js', () => ({
  getItems: vi.fn(),
  getItemById: vi.fn(),
  createItem: vi.fn(),
  updateItem: vi.fn(),
  deleteItem: vi.fn(),
  isItemUsedInRecipes: vi.fn(),
  searchByName: vi.fn(),
}));

// Mock correct pour itemsModel.js
vi.mock('../../src/models/itemsModel.js', () => ({
  validateItem: vi.fn(),
}));

describe('Item Service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getItems', () => {
    it('✅ doit retourner tous les items', async () => {
      const mockItems = [
        {
          ID_Item: 1,
          Name: 'Bois',
          Image_Path: '/images/bois.png',
        },
        {
          ID_Item: 2,
          Name: 'Pierre',
          Image_Path: '/images/pierre.png',
        },
      ];

      itemRepository.getItems.mockResolvedValue(mockItems);

      const result = await itemService.getItems();
      expect(result).toEqual(mockItems);
      expect(itemRepository.getItems).toHaveBeenCalledTimes(1);
    });

    it('❌ doit lancer une erreur en cas de problème', async () => {
      const mockError = new Error('Database error');
      itemRepository.getItems.mockRejectedValue(mockError);

      await expect(itemService.getItems()).rejects.toThrow();
    });
  });

  describe('getItemById', () => {
    it('✅ doit retourner un item par son ID', async () => {
      const mockItem = {
        ID_Item: 1,
        Name: 'Bois',
        Image_Path: '/images/bois.png',
      };
      itemRepository.getItemById.mockResolvedValue(mockItem);

      const result = await itemService.getItemById(1);
      expect(result).toEqual(mockItem);
      expect(itemRepository.getItemById).toHaveBeenCalledWith(1);
    });

    it("❌ doit lancer une erreur si l'item n'existe pas", async () => {
      itemRepository.getItemById.mockResolvedValue(null);

      await expect(itemService.getItemById(999)).rejects.toEqual(
        expect.objectContaining({
          status: 404,
          message: "Item avec l'ID 999 introuvable",
        })
      );
    });
  });

  describe('createItem', () => {
    it('✅ doit créer un item avec des données valides', async () => {
      const itemData = {
        Name: 'Fer',
        Image_Path: '/images/fer.png',
      };

      validateItem.mockReturnValue({ isValid: true, errors: [] });

      const createdItem = { ID_Item: 3, ...itemData };
      itemRepository.createItem.mockResolvedValue(createdItem);

      const result = await itemService.createItem(itemData);
      expect(result).toEqual(createdItem);
      expect(validateItem).toHaveBeenCalledWith(itemData);
      expect(itemRepository.createItem).toHaveBeenCalledWith(itemData);
    });

    it('❌ doit lancer une erreur pour des données invalides', async () => {
      const invalidData = {
        Name: '',
        Image_Path: '/images/invalid.png',
      };

      validateItem.mockReturnValue({
        isValid: false,
        errors: ["Le nom de l'item est requis"],
      });

      await expect(itemService.createItem(invalidData)).rejects.toEqual(
        expect.objectContaining({
          status: 400,
          message: expect.arrayContaining(["Le nom de l'item est requis"]),
        })
      );

      expect(itemRepository.createItem).not.toHaveBeenCalled();
    });
  });

  describe('updateItem', () => {
    it('✅ doit mettre à jour un item avec des données valides', async () => {
      const itemData = {
        Name: 'Bois Traité',
        Image_Path: '/images/bois_traite.png',
      };

      validateItem.mockReturnValue({ isValid: true, errors: [] });
      itemRepository.getItemById.mockResolvedValue({
        ID_Item: 1,
        Name: 'Bois',
        Image_Path: '/images/bois.png',
      });

      const updatedItem = { ID_Item: 1, ...itemData };
      itemRepository.updateItem.mockResolvedValue(updatedItem);

      const result = await itemService.updateItem(1, itemData);
      expect(result).toEqual(updatedItem);
      expect(itemRepository.getItemById).toHaveBeenCalledWith(1);
      expect(validateItem).toHaveBeenCalledWith(itemData);
      expect(itemRepository.updateItem).toHaveBeenCalledWith(1, itemData);
    });

    it("❌ doit lancer une erreur si l'item n'existe pas", async () => {
      itemRepository.getItemById.mockResolvedValue(null);

      const itemData = {
        Name: 'Item Inexistant',
        Image_Path: '/images/inexistant.png',
      };

      await expect(itemService.updateItem(999, itemData)).rejects.toEqual(
        expect.objectContaining({
          status: 404,
          message: "Item avec l'ID 999 introuvable",
        })
      );

      expect(validateItem).not.toHaveBeenCalled();
      expect(itemRepository.updateItem).not.toHaveBeenCalled();
    });

    it('❌ doit lancer une erreur pour des données invalides', async () => {
      const invalidData = {
        Name: '',
        Image_Path: '/images/invalid.png',
      };

      itemRepository.getItemById.mockResolvedValue({
        ID_Item: 1,
        Name: 'Bois',
        Image_Path: '/images/bois.png',
      });
      validateItem.mockReturnValue({
        isValid: false,
        errors: ["Le nom de l'item est requis"],
      });

      await expect(itemService.updateItem(1, invalidData)).rejects.toEqual(
        expect.objectContaining({
          status: 400,
          message: ["Le nom de l'item est requis"],
        })
      );

      expect(itemRepository.updateItem).not.toHaveBeenCalled();
    });
  });

  describe('deleteItem', () => {
    it('✅ doit supprimer un item existant', async () => {
      itemRepository.getItemById.mockResolvedValue({
        ID_Item: 1,
        Name: 'Bois',
        Image_Path: '/images/bois.png',
      });
      itemRepository.isItemUsedInRecipes.mockResolvedValue(false);
      itemRepository.deleteItem.mockResolvedValue(1);

      const result = await itemService.deleteItem(1);
      expect(result).toBe(1);
      expect(itemRepository.getItemById).toHaveBeenCalledWith(1);
      expect(itemRepository.isItemUsedInRecipes).toHaveBeenCalledWith(1);
      expect(itemRepository.deleteItem).toHaveBeenCalledWith(1);
    });

    it("❌ doit lancer une erreur si l'item n'existe pas", async () => {
      itemRepository.getItemById.mockResolvedValue(null);

      await expect(itemService.deleteItem(999)).rejects.toEqual(
        expect.objectContaining({
          status: 404,
          message: "Item avec l'ID 999 introuvable",
        })
      );

      expect(itemRepository.deleteItem).not.toHaveBeenCalled();
    });
  });
});
