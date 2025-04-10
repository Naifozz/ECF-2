import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as recipesService from '../../src/services/recipesService.js';
import * as recipesRepository from '../../src/repositories/recipesRepository.js';
import * as recipesModel from '../../src/models/recipesModel.js';

vi.mock('../../src/repositories/recipesRepository.js');
vi.mock('../../src/models/recipesModel.js', () => ({
  validateRecipe: vi.fn(),
  getGridPosition: vi.fn(),
}));

describe('Recipe Service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getRecipes', () => {
    it('✅ doit retourner toutes les recettes', async () => {
      const mockRecipes = [
        { ID_Recipe: 1, ID_Item_Result: 3 },
        { ID_Recipe: 2, ID_Item_Result: 2 },
      ];
      recipesRepository.getRecipes.mockResolvedValue(mockRecipes);

      const result = await recipesService.getRecipes();

      expect(recipesRepository.getRecipes).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockRecipes);
    });

    it('❌ doit gérer les erreurs', async () => {
      const errorMessage = 'Erreur de base de données';
      recipesRepository.getRecipes.mockRejectedValue(new Error(errorMessage));

      await expect(recipesService.getRecipes()).rejects.toThrow(errorMessage);
    });
  });

  describe('getRecipeById', () => {
    it('✅ doit retourner une recette par son ID', async () => {
      const mockRecipe = { ID_Recipe: 1, ID_Item_Result: 3 };
      recipesRepository.getRecipeById.mockResolvedValue(mockRecipe);

      const result = await recipesService.getRecipeById(1);

      expect(recipesRepository.getRecipeById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockRecipe);
    });

    it("❌ doit lancer une erreur si la recette n'existe pas", async () => {
      recipesRepository.getRecipeById.mockResolvedValue(undefined);

      await expect(recipesService.getRecipeById(999)).rejects.toEqual(
        expect.objectContaining({
          status: 404,
          message: "Recette avec l'ID 999 introuvable",
        })
      );
    });
  });

  describe('getAllRecipesWithIngredients', () => {
    it('✅ doit retourner toutes les recettes avec ingrédients', async () => {
      const mockRecipesWithIngredients = [
        { ID_Recipe: 1, ID_Item: 1, Name: 'Bois', Position: 0 },
        { ID_Recipe: 1, ID_Item: 1, Name: 'Bois', Position: 1 },
      ];
      recipesRepository.getRecipesWithIngredients.mockResolvedValue(
        mockRecipesWithIngredients
      );

      const result = await recipesService.getAllRecipesWithIngredients();

      expect(recipesRepository.getRecipesWithIngredients).toHaveBeenCalledTimes(
        1
      );
      expect(result).toEqual(mockRecipesWithIngredients);
    });
  });

  describe('getRecipeWithIngredients', () => {
    it('✅ doit retourner une recette avec ses ingrédients', async () => {
      const mockRecipeWithIngredients = {
        ID_Recipe: 1,
        ID_Item_Result: 3,
        Result: {
          ID_Item: 3,
          Name: 'Planche',
          Image_Path: '/images/planche.png',
        },
        Ingredients: [
          {
            ID_Item: 1,
            Name: 'Bois',
            Position: 0,
            Image_Path: '/images/bois.png',
          },
          {
            ID_Item: 1,
            Name: 'Bois',
            Position: 1,
            Image_Path: '/images/bois.png',
          },
        ],
      };
      recipesRepository.getRecipeWithIngredients.mockResolvedValue(
        mockRecipeWithIngredients
      );

      const result = await recipesService.getRecipeWithIngredients(1);

      expect(recipesRepository.getRecipeWithIngredients).toHaveBeenCalledWith(
        1
      );
      expect(result).toEqual(mockRecipeWithIngredients);
    });

    it("❌ doit lancer une erreur si la recette n'existe pas", async () => {
      recipesRepository.getRecipeWithIngredients.mockResolvedValue(undefined);

      await expect(
        recipesService.getRecipeWithIngredients(999)
      ).rejects.toEqual(
        expect.objectContaining({
          status: 404,
          message: "Recette avec l'ID 999 introuvable",
        })
      );
    });
  });

  describe('createRecipe', () => {
    it('✅ doit créer une nouvelle recette avec des données valides', async () => {
      const validRecipe = {
        ID_Item_Result: 2,
        ingredients: [
          { ID_Item: 1, Position: 1 },
          { ID_Item: 1, Position: 2 },
        ],
      };
      const normalizedRecipe = {
        ID_Item_Result: 2,
        Ingredients: [
          { ID_Item: 1, Position: 1 },
          { ID_Item: 1, Position: 2 },
        ],
      };
      const createdRecipe = {
        ID_Recipe: 2,
        ID_Item_Result: 2,
        Ingredients: [
          {
            ID_Item: 1,
            Position: 1,
            Name: 'Bois',
            Image_Path: '/images/bois.png',
          },
          {
            ID_Item: 1,
            Position: 2,
            Name: 'Bois',
            Image_Path: '/images/bois.png',
          },
        ],
      };

      recipesModel.validateRecipe.mockReturnValue({
        isValid: true,
        errors: [],
      });
      recipesRepository.createRecipe.mockResolvedValue(createdRecipe);

      const result = await recipesService.createRecipe(validRecipe);

      expect(recipesModel.validateRecipe).toHaveBeenCalledWith(validRecipe);
      expect(recipesRepository.createRecipe).toHaveBeenCalledWith(
        normalizedRecipe
      );
      expect(result).toEqual(createdRecipe);
    });

    it('❌ doit rejeter la création avec des données invalides', async () => {
      const invalidRecipe = {
        ID_Item_Result: 0, // ID invalide
        ingredients: [], // tableau vide
      };

      const validationErrors = [
        "L'ID de l'item résultant doit être un nombre positif",
        'La recette doit contenir au moins un ingrédient',
      ];

      recipesModel.validateRecipe.mockReturnValue({
        isValid: false,
        errors: validationErrors,
      });

      await expect(recipesService.createRecipe(invalidRecipe)).rejects.toEqual(
        expect.objectContaining({
          status: 400,
          message: validationErrors.join(', '),
        })
      );

      expect(recipesRepository.createRecipe).not.toHaveBeenCalled();
    });
  });

  describe('updateRecipe', () => {
    it('✅ doit mettre à jour une recette existante avec des données valides', async () => {
      const recipeId = 1;
      const validUpdatedData = {
        ID_Item_Result: 2,
        ingredients: [
          { ID_Item: 2, Position: 1 },
          { ID_Item: 2, Position: 2 },
        ],
      };
      const normalizedUpdatedData = {
        ID_Item_Result: 2,
        Ingredients: [
          { ID_Item: 2, Position: 1 },
          { ID_Item: 2, Position: 2 },
        ],
      };
      const updatedRecipe = {
        ID_Recipe: 1,
        ID_Item_Result: 2,
        Ingredients: [
          {
            ID_Item: 2,
            Position: 1,
            Name: 'Pierre',
            Image_Path: '/images/pierre.png',
          },
          {
            ID_Item: 2,
            Position: 2,
            Name: 'Pierre',
            Image_Path: '/images/pierre.png',
          },
        ],
      };

      recipesModel.validateRecipe.mockReturnValue({
        isValid: true,
        errors: [],
      });
      recipesRepository.updateRecipe.mockResolvedValue(updatedRecipe);

      const result = await recipesService.updateRecipe(
        recipeId,
        validUpdatedData
      );

      expect(recipesModel.validateRecipe).toHaveBeenCalledWith(
        validUpdatedData
      );
      expect(recipesRepository.updateRecipe).toHaveBeenCalledWith(
        recipeId,
        normalizedUpdatedData
      );
      expect(result).toEqual(updatedRecipe);
    });

    it('❌ doit rejeter la mise à jour avec des données invalides', async () => {
      const recipeId = 1;
      const invalidUpdatedData = {
        ID_Item_Result: -1, // ID négatif invalide
        ingredients: [
          { ID_Item: 2, Position: 10 }, // Position > 9 invalide
        ],
      };

      const validationErrors = [
        "L'ID de l'item résultant doit être un nombre positif",
        "La position doit être entre 1 et 9 pour l'ingrédient à la position 1",
      ];

      recipesModel.validateRecipe.mockReturnValue({
        isValid: false,
        errors: validationErrors,
      });

      await expect(
        recipesService.updateRecipe(recipeId, invalidUpdatedData)
      ).rejects.toEqual(
        expect.objectContaining({
          status: 400,
          message: validationErrors.join(', '),
        })
      );

      expect(recipesRepository.updateRecipe).not.toHaveBeenCalled();
    });

    it("❌ doit lancer une erreur si la recette n'existe pas", async () => {
      const recipeId = 999;
      const validUpdatedData = {
        ID_Item_Result: 2,
        ingredients: [{ ID_Item: 1, Position: 1 }],
      };

      recipesModel.validateRecipe.mockReturnValue({
        isValid: true,
        errors: [],
      });
      recipesRepository.updateRecipe.mockResolvedValue(undefined);

      await expect(
        recipesService.updateRecipe(recipeId, validUpdatedData)
      ).rejects.toEqual(
        expect.objectContaining({
          status: 404,
          message: "Recette avec l'ID 999 introuvable",
        })
      );
    });
  });

  describe('deleteRecipe', () => {
    it('✅ doit supprimer une recette existante', async () => {
      const recipeId = 1;
      recipesRepository.deleteRecipe.mockResolvedValue(1);

      const result = await recipesService.deleteRecipe(recipeId);

      expect(recipesRepository.deleteRecipe).toHaveBeenCalledWith(recipeId);
      expect(result).toBe(true);
    });

    it("❌ doit lancer une erreur si la recette n'existe pas", async () => {
      const recipeId = 999;
      recipesRepository.deleteRecipe.mockResolvedValue(0);

      await expect(recipesService.deleteRecipe(recipeId)).rejects.toEqual(
        expect.objectContaining({
          status: 404,
          message: "Recette avec l'ID 999 introuvable",
        })
      );
    });
  });
});
