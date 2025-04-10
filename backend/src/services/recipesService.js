import * as recipesRepository from '../repositories/recipesRepository.js';
import { validateRecipe } from '../models/recipesModel.js';

export const getRecipes = async () => {
  try {
    const recipes = await recipesRepository.getRecipes();
    return recipes;
  } catch (error) {
    console.error('Error getting recipes', error);
    throw error;
  }
};

export const getRecipeById = async (id) => {
  try {
    const recipe = await recipesRepository.getRecipeById(id);
    if (!recipe) {
      throw { status: 404, message: `Recette avec l'ID ${id} introuvable` };
    }
    return recipe;
  } catch (error) {
    console.error('Error getting recipe', error);
    throw error;
  }
};

export const getAllRecipesWithIngredients = async () => {
  try {
    const recipes = await recipesRepository.getRecipesWithIngredients();
    return recipes;
  } catch (error) {
    console.error('Error getting recipes with ingredients', error);
    throw error;
  }
};

export const getRecipeWithIngredients = async (id) => {
  try {
    const recipe = await recipesRepository.getRecipeWithIngredients(id);
    if (!recipe) {
      throw { status: 404, message: `Recette avec l'ID ${id} introuvable` };
    }
    return recipe;
  } catch (error) {
    console.error('Error getting recipe with ingredients', error);
    throw error;
  }
};

export const createRecipe = async (data) => {
  try {
    const validation = validateRecipe(data);
    if (!validation.isValid) {
      throw { status: 400, message: validation.errors.join(', ') };
    }

    const normalizedData = {
      ID_Item_Result: data.ID_Item_Result,
      Ingredients: data.ingredients, // transformer 'ingredients' en 'Ingredients'
    };

    const recipe = await recipesRepository.createRecipe(normalizedData);
    return recipe;
  } catch (error) {
    console.error('Error creating recipe', error);
    throw error;
  }
};

export const updateRecipe = async (id, data) => {
  try {
    // Valider les données avant la mise à jour
    const validation = validateRecipe(data);
    if (!validation.isValid) {
      throw { status: 400, message: validation.errors.join(', ') };
    }

    const normalizedData = {
      ID_Item_Result: data.ID_Item_Result,
      Ingredients: data.ingredients, // transformer 'ingredients' en 'Ingredients'
    };

    const recipe = await recipesRepository.updateRecipe(id, normalizedData);
    if (!recipe) {
      throw { status: 404, message: `Recette avec l'ID ${id} introuvable` };
    }
    return recipe;
  } catch (error) {
    console.error('Error updating recipe', error);
    throw error;
  }
};

export const deleteRecipe = async (id) => {
  try {
    const result = await recipesRepository.deleteRecipe(id);
    if (result === 0) {
      throw { status: 404, message: `Recette avec l'ID ${id} introuvable` };
    }
    return result === 1; // Retourne true si 1 ligne a été affectée
  } catch (error) {
    console.error('Error deleting recipe', error);
    throw error;
  }
};
