process.env.NODE_ENV = 'test';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as itemService from '../../src/services/itemsService.js';
import * as itemController from '../../src/controllers/itemsController.js';

vi.mock('../../src/services/itemsService.js');

describe('Item Controllers', () => {
  let req, res;

  beforeEach(() => {
    vi.resetAllMocks();

    req = {
      params: {},
      body: {},
      query: {},
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };
  });

  describe('getItems', () => {
    it('✅ doit retourner tous les items avec un statut 200', async () => {
      const mockItems = [
        { ID_Item: 1, Name: 'Bois', Image_Path: '/images/bois.png' },
        { ID_Item: 2, Name: 'Pierre', Image_Path: '/images/pierre.png' },
      ];

      itemService.getItems.mockResolvedValue(mockItems);

      await itemController.getItems(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockItems);
    });

    it('❌ doit gérer les erreurs et retourner un statut 500', async () => {
      const error = new Error('Erreur de base de données');
      itemService.getItems.mockRejectedValue(error);

      await itemController.getItems(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Erreur lors de la récupération des items',
      });
    });
  });

  describe('getItemById', () => {
    it('✅ doit retourner un item par son ID avec un statut 200', async () => {
      const mockItem = {
        ID_Item: 1,
        Name: 'Bois',
        Image_Path: '/images/bois.png',
      };
      itemService.getItemById.mockResolvedValue(mockItem);

      req.params.id = '1';

      await itemController.getItemById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockItem);
    });

    it("❌ doit retourner un statut 404 quand l'item n'existe pas", async () => {
      const errorMessage = "Item avec l'ID 999 introuvable";
      const error = { status: 404, message: errorMessage };
      itemService.getItemById.mockRejectedValue(error);

      req.params.id = '999';

      await itemController.getItemById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: errorMessage,
      });
    });

    it('❌ doit retourner un statut 500 pour les erreurs génériques', async () => {
      const error = new Error('Erreur interne');
      itemService.getItemById.mockRejectedValue(error);

      req.params.id = '1';

      await itemController.getItemById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Erreur lors de la récupération de l'item",
      });
    });
  });

  describe('createItem', () => {
    it('✅ doit créer un item et retourner un statut 201', async () => {
      const itemData = {
        Name: 'Fer',
        Image_Path: '/images/fer.png',
      };

      const createdItem = { ID_Item: 3, ...itemData };

      req.body = itemData;
      itemService.createItem.mockResolvedValue(createdItem);

      await itemController.createItem(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(createdItem);
    });

    it('❌ doit retourner un statut 400 pour les erreurs de validation', async () => {
      const validationErrors = ["Le nom de l'item est requis"];
      const error = {
        status: 400,
        message: validationErrors,
      };

      itemService.createItem.mockRejectedValue(error);

      req.body = {
        Name: '',
        Image_Path: '/images/invalid.png',
      };

      await itemController.createItem(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: validationErrors,
      });
    });

    it('❌ doit retourner un statut 500 pour les erreurs serveur', async () => {
      const error = new Error('Erreur de base de données');
      itemService.createItem.mockRejectedValue(error);

      req.body = {
        Name: 'Fer',
        Image_Path: '/images/fer.png',
      };

      await itemController.createItem(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Erreur lors de la création de l'item",
      });
    });
  });

  describe('updateItem', () => {
    it('✅ doit mettre à jour un item et retourner un statut 200', async () => {
      const itemData = {
        Name: 'Bois Traité',
        Image_Path: '/images/bois_traite.png',
      };

      const updatedItem = { ID_Item: 1, ...itemData };

      req.params.id = '1';
      req.body = itemData;
      itemService.updateItem.mockResolvedValue(updatedItem);

      await itemController.updateItem(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedItem);
    });

    it("❌ doit retourner un statut 404 quand l'item à mettre à jour n'existe pas", async () => {
      const errorMessage = "Item avec l'ID 999 introuvable";
      const error = { status: 404, message: errorMessage };

      itemService.updateItem.mockRejectedValue(error);

      req.params.id = '999';
      req.body = {
        Name: 'Item Valide',
        Image_Path: '/images/valide.png',
      };

      await itemController.updateItem(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: errorMessage,
      });
    });

    it('❌ doit retourner un statut 400 pour les erreurs de validation', async () => {
      const validationErrors = ["Le nom de l'item est requis"];
      const error = {
        status: 400,
        message: validationErrors,
      };

      itemService.updateItem.mockRejectedValue(error);

      req.params.id = '1';
      req.body = {
        Name: '',
        Image_Path: '/images/invalid.png',
      };

      await itemController.updateItem(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: validationErrors,
      });
    });

    it('❌ doit retourner un statut 500 pour les erreurs serveur', async () => {
      const error = new Error('Erreur de base de données');
      itemService.updateItem.mockRejectedValue(error);

      req.params.id = '1';
      req.body = {
        Name: 'Bois Traité',
        Image_Path: '/images/bois_traite.png',
      };

      await itemController.updateItem(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Erreur lors de la mise à jour de l'item",
      });
    });
  });

  describe('deleteItem', () => {
    it('✅ doit supprimer un item et retourner un statut 200', async () => {
      itemService.deleteItem.mockResolvedValue(1);

      req.params.id = '1';

      await itemController.deleteItem(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Item supprimé avec succès',
      });
    });

    it("❌ doit retourner un statut 404 quand l'item à supprimer n'existe pas", async () => {
      const errorMessage = "Item avec l'ID 999 introuvable";
      const error = { status: 404, message: errorMessage };

      itemService.deleteItem.mockRejectedValue(error);

      req.params.id = '999';

      await itemController.deleteItem(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: errorMessage,
      });
    });

    it("❌ doit retourner un statut 400 quand l'item est utilisé dans des recettes", async () => {
      const errorMessage =
        "Impossible de supprimer l'item car il est utilisé dans des recettes";
      const error = { status: 400, message: errorMessage };

      itemService.deleteItem.mockRejectedValue(error);

      req.params.id = '1';

      await itemController.deleteItem(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: errorMessage,
      });
    });

    it('❌ doit retourner un statut 500 pour les erreurs serveur', async () => {
      const error = new Error('Erreur de base de données');
      itemService.deleteItem.mockRejectedValue(error);

      req.params.id = '1';

      await itemController.deleteItem(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Erreur lors de la suppression de l'item",
      });
    });
  });
});
