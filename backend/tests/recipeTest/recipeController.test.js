import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as recipesController from '../../src/controllers/recipesController.js';
import * as recipesService from '../../src/services/recipesService.js';

// Mock recipesService
vi.mock('../../src/services/recipesService.js');

describe('Recipes Controller', () => {
  let req, res, next;

  beforeEach(() => {
    // Reset all mocks
    vi.resetAllMocks();

    // Setup request, response and next mocks
    req = {
      params: {},
      body: {},
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      send: vi.fn(),
    };

    next = vi.fn();
  });

  describe('getRecipes', () => {
    it('✅ doit retourner toutes les recettes avec statut 200', async () => {
      const mockRecipes = [
        { ID_Recipe: 1, ID_Item_Result: 3 },
        { ID_Recipe: 2, ID_Item_Result: 2 },
      ];

      recipesService.getRecipes.mockResolvedValue(mockRecipes);

      await recipesController.getRecipes(req, res, next);

      expect(recipesService.getRecipes).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockRecipes);
    });

    it("❌ doit appeler next avec l'erreur en cas d'échec", async () => {
      const error = new Error('Erreur de base de données');
      recipesService.getRecipes.mockRejectedValue(error);

      await recipesController.getRecipes(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getRecipeById', () => {
    it('✅ doit retourner une recette par son ID avec statut 200', async () => {
      const mockRecipe = { ID_Recipe: 1, ID_Item_Result: 3 };
      req.params.id = '1';

      recipesService.getRecipeById.mockResolvedValue(mockRecipe);

      await recipesController.getRecipeById(req, res, next);

      expect(recipesService.getRecipeById).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockRecipe);
    });

    it("❌ doit retourner une erreur 400 si l'ID n'est pas un nombre", async () => {
      req.params.id = 'abc';

      await recipesController.getRecipeById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "L'ID doit être un nombre",
      });
      expect(recipesService.getRecipeById).not.toHaveBeenCalled();
    });

    it('❌ doit gérer les erreurs avec statut du service', async () => {
      req.params.id = '999';
      const error = {
        status: 404,
        message: "Recette avec l'ID 999 introuvable",
      };

      recipesService.getRecipeById.mockRejectedValue(error);

      await recipesController.getRecipeById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: error.message });
    });

    it('❌ doit appeler next pour les erreurs sans statut', async () => {
      req.params.id = '1';
      const error = new Error('Erreur inattendue');

      recipesService.getRecipeById.mockRejectedValue(error);

      await recipesController.getRecipeById(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getAllRecipesWithIngredients', () => {
    it('✅ doit retourner toutes les recettes avec leurs ingrédients', async () => {
      const mockRecipesWithIngredients = [
        { ID_Recipe: 1, ingredients: [{ ID_Item: 1, Position: 1 }] },
        { ID_Recipe: 2, ingredients: [{ ID_Item: 2, Position: 1 }] },
      ];

      recipesService.getAllRecipesWithIngredients.mockResolvedValue(
        mockRecipesWithIngredients
      );

      await recipesController.getAllRecipesWithIngredients(req, res, next);

      expect(recipesService.getAllRecipesWithIngredients).toHaveBeenCalledTimes(
        1
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockRecipesWithIngredients);
    });

    it("❌ doit appeler next avec l'erreur en cas d'échec", async () => {
      const error = new Error('Erreur de base de données');
      recipesService.getAllRecipesWithIngredients.mockRejectedValue(error);

      await recipesController.getAllRecipesWithIngredients(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getRecipeWithIngredients', () => {
    it('✅ doit retourner une recette avec ses ingrédients', async () => {
      const mockRecipeWithIngredients = {
        ID_Recipe: 1,
        ID_Item_Result: 3,
        ingredients: [
          { ID_Item: 1, Position: 1 },
          { ID_Item: 1, Position: 2 },
        ],
      };
      req.params.id = '1';

      recipesService.getRecipeWithIngredients.mockResolvedValue(
        mockRecipeWithIngredients
      );

      await recipesController.getRecipeWithIngredients(req, res, next);

      expect(recipesService.getRecipeWithIngredients).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockRecipeWithIngredients);
    });

    it("❌ doit retourner une erreur 400 si l'ID n'est pas un nombre", async () => {
      req.params.id = 'abc';

      await recipesController.getRecipeWithIngredients(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "L'ID doit être un nombre",
      });
      expect(recipesService.getRecipeWithIngredients).not.toHaveBeenCalled();
    });

    it('❌ doit gérer les erreurs avec statut du service', async () => {
      req.params.id = '999';
      const error = {
        status: 404,
        message: "Recette avec l'ID 999 introuvable",
      };

      recipesService.getRecipeWithIngredients.mockRejectedValue(error);

      await recipesController.getRecipeWithIngredients(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: error.message });
    });
  });

  describe('createRecipe', () => {
    it('✅ doit créer une nouvelle recette avec statut 201', async () => {
      const newRecipeData = {
        ID_Item_Result: 2,
        ingredients: [
          { ID_Item: 1, Position: 1 },
          { ID_Item: 1, Position: 2 },
        ],
      };

      const createdRecipe = {
        ID_Recipe: 3,
        ID_Item_Result: 2,
        ingredients: [
          { ID_Item: 1, Position: 1 },
          { ID_Item: 1, Position: 2 },
        ],
      };

      req.body = newRecipeData;
      recipesService.createRecipe.mockResolvedValue(createdRecipe);

      await recipesController.createRecipe(req, res, next);

      expect(recipesService.createRecipe).toHaveBeenCalledWith(newRecipeData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(createdRecipe);
    });

    it('❌ doit gérer les erreurs de validation du service', async () => {
      const invalidRecipeData = {
        ID_Item_Result: -1,
        ingredients: [],
      };

      const error = {
        status: 400,
        message:
          "L'ID de l'item résultant doit être un nombre positif, La recette doit contenir au moins un ingrédient",
      };

      req.body = invalidRecipeData;
      recipesService.createRecipe.mockRejectedValue(error);

      await recipesController.createRecipe(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: error.message });
    });
  });

  describe('updateRecipe', () => {
    it('✅ doit mettre à jour une recette existante', async () => {
      const recipeId = 1;
      const updateData = {
        ID_Item_Result: 3,
        ingredients: [
          { ID_Item: 2, Position: 1 },
          { ID_Item: 2, Position: 2 },
        ],
      };

      const updatedRecipe = {
        ID_Recipe: recipeId,
        ID_Item_Result: 3,
        ingredients: [
          { ID_Item: 2, Position: 1 },
          { ID_Item: 2, Position: 2 },
        ],
      };

      req.params.id = recipeId.toString();
      req.body = updateData;
      recipesService.updateRecipe.mockResolvedValue(updatedRecipe);

      await recipesController.updateRecipe(req, res, next);

      expect(recipesService.updateRecipe).toHaveBeenCalledWith(
        recipeId,
        updateData
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedRecipe);
    });

    it("❌ doit retourner une erreur 400 si l'ID n'est pas un nombre", async () => {
      req.params.id = 'abc';

      await recipesController.updateRecipe(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "L'ID doit être un nombre",
      });
      expect(recipesService.updateRecipe).not.toHaveBeenCalled();
    });

    it('❌ doit gérer les erreurs avec statut du service', async () => {
      req.params.id = '999';
      req.body = {
        ID_Item_Result: 3,
        ingredients: [{ ID_Item: 2, Position: 1 }],
      };

      const error = {
        status: 404,
        message: "Recette avec l'ID 999 introuvable",
      };
      recipesService.updateRecipe.mockRejectedValue(error);

      await recipesController.updateRecipe(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: error.message });
    });
  });

  describe('deleteRecipe', () => {
    it('✅ doit supprimer une recette et retourner un statut 204', async () => {
      const recipeId = 1;
      req.params.id = recipeId.toString();

      recipesService.deleteRecipe.mockResolvedValue(true);

      await recipesController.deleteRecipe(req, res, next);

      expect(recipesService.deleteRecipe).toHaveBeenCalledWith(recipeId);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it("❌ doit retourner une erreur 400 si l'ID n'est pas un nombre", async () => {
      req.params.id = 'abc';

      await recipesController.deleteRecipe(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "L'ID doit être un nombre",
      });
      expect(recipesService.deleteRecipe).not.toHaveBeenCalled();
    });

    it('❌ doit gérer les erreurs avec statut du service', async () => {
      req.params.id = '999';
      const error = {
        status: 404,
        message: "Recette avec l'ID 999 introuvable",
      };

      recipesService.deleteRecipe.mockRejectedValue(error);

      await recipesController.deleteRecipe(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: error.message });
    });
  });
});
