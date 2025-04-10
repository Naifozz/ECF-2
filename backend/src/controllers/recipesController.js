import * as recipesService from '../services/recipesService.js';

export const getRecipes = async (req, res, next) => {
  try {
    const recipes = await recipesService.getRecipes();
    res.status(200).json(recipes);
  } catch (error) {
    next(error);
  }
};

export const getRecipeById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "L'ID doit être un nombre" });
    }

    const recipe = await recipesService.getRecipeById(id);
    res.status(200).json(recipe);
  } catch (error) {
    if (error.status) {
      res.status(error.status).json({ message: error.message });
    } else {
      next(error);
    }
  }
};

export const getAllRecipesWithIngredients = async (req, res, next) => {
  try {
    const recipes = await recipesService.getAllRecipesWithIngredients();
    res.status(200).json(recipes);
  } catch (error) {
    next(error);
  }
};

export const getRecipeWithIngredients = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "L'ID doit être un nombre" });
    }

    const recipe = await recipesService.getRecipeWithIngredients(id);
    res.status(200).json(recipe);
  } catch (error) {
    if (error.status) {
      res.status(error.status).json({ message: error.message });
    } else {
      next(error);
    }
  }
};

export const createRecipe = async (req, res, next) => {
  try {
    const recipeData = req.body;
    const newRecipe = await recipesService.createRecipe(recipeData);
    res.status(201).json(newRecipe);
  } catch (error) {
    if (error.status) {
      res.status(error.status).json({ message: error.message });
    } else {
      next(error);
    }
  }
};

export const updateRecipe = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "L'ID doit être un nombre" });
    }

    const recipeData = req.body;
    const updatedRecipe = await recipesService.updateRecipe(id, recipeData);
    res.status(200).json(updatedRecipe);
  } catch (error) {
    if (error.status) {
      res.status(error.status).json({ message: error.message });
    } else {
      next(error);
    }
  }
};

export const deleteRecipe = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "L'ID doit être un nombre" });
    }

    await recipesService.deleteRecipe(id);
    res.status(204).send();
  } catch (error) {
    if (error.status) {
      res.status(error.status).json({ message: error.message });
    } else {
      next(error);
    }
  }
};
