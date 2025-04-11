process.env.NODE_ENV = 'test';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as recipeRepository from '../../src/repositories/recipesRepository.js';
import { openDb } from '../../database/db.js';

describe('Recipe Repository', () => {
  let db;

  beforeEach(async () => {
    db = await openDb();

    await db.run('DELETE FROM ITEM_RECIPE');
    await db.run('DELETE FROM RECIPE');
    await db.run('DELETE FROM ITEM');

    const recipeCount = await db.get('SELECT COUNT(*) as count FROM RECIPE');
    if (recipeCount.count > 0) {
      throw new Error(
        `La table RECIPE n'est pas vide: ${recipeCount.count} recettes restantes`
      );
    }

    await db.run(
      'INSERT INTO ITEM (ID_Item, Name, Image_Path) VALUES (?, ?, ?)',
      [1, 'Bois', '/images/bois.png']
    );
    await db.run(
      'INSERT INTO ITEM (ID_Item, Name, Image_Path) VALUES (?, ?, ?)',
      [2, 'Pierre', '/images/pierre.png']
    );
    await db.run(
      'INSERT INTO ITEM (ID_Item, Name, Image_Path) VALUES (?, ?, ?)',
      [3, 'Planche', '/images/planche.png']
    );

    await db.run(
      'INSERT INTO RECIPE (ID_Recipe, ID_Item_Result) VALUES (?, ?)',
      [1, 3]
    );

    await db.run(
      'INSERT INTO ITEM_RECIPE (ID_Recipe, ID_Item, Position) VALUES (?, ?, ?)',
      [1, 1, 0]
    );
    await db.run(
      'INSERT INTO ITEM_RECIPE (ID_Recipe, ID_Item, Position) VALUES (?, ?, ?)',
      [1, 1, 1]
    );

    const checkCount = await db.get('SELECT COUNT(*) as count FROM RECIPE');
    if (checkCount.count !== 1) {
      throw new Error(
        `Problème avec les données de test: ${checkCount.count} recettes présentes au lieu de 1`
      );
    }
  });

  afterEach(async () => {
    await db.run('DELETE FROM ITEM_RECIPE');
    await db.run('DELETE FROM RECIPE');
    await db.run('DELETE FROM ITEM');
    await db.close();
  });

  describe('getRecipes', () => {
    it('✅ doit retourner toutes les recettes', async () => {
      const recipes = await recipeRepository.getRecipes();

      expect(recipes).toHaveLength(1);
      expect(recipes[0]).toHaveProperty('ID_Recipe', 1);
      expect(recipes[0]).toHaveProperty('ID_Item_Result', 3);
    });
  });

  describe('getRecipeById', () => {
    it('✅ doit retourner une recette par son ID', async () => {
      const recipe = await recipeRepository.getRecipeById(1);

      expect(recipe).not.toBeNull();
      expect(recipe).toHaveProperty('ID_Recipe', 1);
      expect(recipe).toHaveProperty('ID_Item_Result', 3);
    });

    it('❌ doit retourner undefined pour un ID inexistant', async () => {
      const recipe = await recipeRepository.getRecipeById(999);
      expect(recipe).toBeUndefined();
    });
  });

  describe('getRecipesWithIngredients', () => {
    it('✅ doit retourner toutes les recettes avec leurs ingrédients', async () => {
      const recipesWithIngredients =
        await recipeRepository.getRecipesWithIngredients();

      expect(recipesWithIngredients).not.toBeNull();
      expect(recipesWithIngredients.length).toBeGreaterThan(0);
      expect(recipesWithIngredients[0]).toHaveProperty('ID_Recipe');
      expect(recipesWithIngredients[0]).toHaveProperty('ID_Item');
      expect(recipesWithIngredients[0]).toHaveProperty('Name');
      expect(recipesWithIngredients[0]).toHaveProperty('Position');
    });
  });

  describe('getRecipeWithIngredients', () => {
    it('✅ doit retourner une recette avec ses ingrédients', async () => {
      const recipeWithIngredients =
        await recipeRepository.getRecipeWithIngredients(1);

      expect(recipeWithIngredients).not.toBeNull();
      expect(recipeWithIngredients).toHaveProperty('ID_Recipe', 1);
      expect(recipeWithIngredients).toHaveProperty('Result');
      expect(recipeWithIngredients.Result).toHaveProperty('ID_Item', 3);
      expect(recipeWithIngredients.Result).toHaveProperty('Name', 'Planche');
      expect(recipeWithIngredients).toHaveProperty('Ingredients');
      expect(recipeWithIngredients.Ingredients).toHaveLength(2);
      expect(recipeWithIngredients.Ingredients[0]).toHaveProperty('ID_Item', 1);
      expect(recipeWithIngredients.Ingredients[0]).toHaveProperty(
        'Name',
        'Bois'
      );
      expect(recipeWithIngredients.Ingredients[0]).toHaveProperty(
        'Position',
        0
      );
    });

    it('❌ doit retourner undefined pour un ID inexistant', async () => {
      const recipeWithIngredients =
        await recipeRepository.getRecipeWithIngredients(999);
      expect(recipeWithIngredients).toBeUndefined();
    });
  });

  describe('createRecipe', () => {
    it('✅ doit créer une nouvelle recette avec ses ingrédients', async () => {
      const newRecipe = {
        ID_Item_Result: 2,
        Ingredients: [
          { ID_Item: 1, Position: 0 },
          { ID_Item: 1, Position: 1 },
          { ID_Item: 1, Position: 2 },
        ],
      };

      const createdRecipe = await recipeRepository.createRecipe(newRecipe);

      expect(createdRecipe).not.toBeNull();
      expect(createdRecipe).toHaveProperty('ID_Recipe');
      expect(createdRecipe).toHaveProperty('ID_Item_Result', 2);
      expect(createdRecipe).toHaveProperty('Ingredients');
      expect(createdRecipe.Ingredients).toHaveLength(3);

      expect(createdRecipe.Ingredients[0]).toHaveProperty('ID_Item', 1);
      expect(createdRecipe.Ingredients[0]).toHaveProperty('Position', 0);
      expect(createdRecipe.Ingredients[0]).toHaveProperty('Name', 'Bois');
      expect(createdRecipe.Ingredients[0]).toHaveProperty(
        'Image_Path',
        '/images/bois.png'
      );

      const recipeInDb = await db.get(
        'SELECT * FROM RECIPE WHERE ID_Item_Result = ?',
        [2]
      );
      expect(recipeInDb).not.toBeNull();

      const ingredientsCount = await db.get(
        'SELECT COUNT(*) as count FROM ITEM_RECIPE WHERE ID_Recipe = ?',
        [recipeInDb.ID_Recipe]
      );
      expect(ingredientsCount.count).toBe(3);
    });
  });

  describe('updateRecipe', () => {
    it('✅ doit mettre à jour une recette existante avec ses ingrédients', async () => {
      const updatedData = {
        ID_Item_Result: 2,
        Ingredients: [
          { ID_Item: 2, Position: 0 },
          { ID_Item: 2, Position: 1 },
        ],
      };

      const updatedRecipe = await recipeRepository.updateRecipe(1, updatedData);

      expect(updatedRecipe).not.toBeNull();
      expect(updatedRecipe).toHaveProperty('ID_Recipe', 1);
      expect(updatedRecipe).toHaveProperty('ID_Item_Result', 2);
      expect(updatedRecipe).toHaveProperty('Ingredients');
      expect(updatedRecipe.Ingredients).toHaveLength(2);

      expect(updatedRecipe.Ingredients[0]).toHaveProperty('ID_Item', 2);
      expect(updatedRecipe.Ingredients[0]).toHaveProperty('Name', 'Pierre');
      expect(updatedRecipe.Ingredients[0]).toHaveProperty(
        'Image_Path',
        '/images/pierre.png'
      );
      expect(updatedRecipe.Ingredients[0]).toHaveProperty('Position', 0);

      const recipeInDb = await db.get(
        'SELECT * FROM RECIPE WHERE ID_Recipe = ?',
        [1]
      );
      expect(recipeInDb.ID_Item_Result).toBe(2);

      const ingredientsCount = await db.get(
        'SELECT COUNT(*) as count FROM ITEM_RECIPE WHERE ID_Recipe = ?',
        [1]
      );
      expect(ingredientsCount.count).toBe(2);
    });

    it("❌ doit retourner undefined si la recette n'existe pas", async () => {
      const updatedData = {
        ID_Item_Result: 2,
        Ingredients: [{ ID_Item: 1, Position: 0 }],
      };

      const updatedRecipe = await recipeRepository.updateRecipe(
        999,
        updatedData
      );
      expect(updatedRecipe).toBeUndefined();
    });
  });

  describe('deleteRecipe', () => {
    it('✅ doit supprimer une recette existante', async () => {
      const result = await recipeRepository.deleteRecipe(1);
      expect(result).toBe(1);

      const recipeInDb = await db.get(
        'SELECT * FROM RECIPE WHERE ID_Recipe = ?',
        [1]
      );
      expect(recipeInDb).toBeUndefined();

      const ingredientsCount = await db.get(
        'SELECT COUNT(*) as count FROM ITEM_RECIPE WHERE ID_Recipe = ?',
        [1]
      );
      expect(ingredientsCount.count).toBe(0);
    });

    it('❌ doit retourner 0 pour un ID inexistant', async () => {
      const result = await recipeRepository.deleteRecipe(999);
      expect(result).toBe(0);
    });
  });
});
