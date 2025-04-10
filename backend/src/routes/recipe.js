import express from 'express';
import {
  getRecipes,
  getRecipeById,
  getAllRecipesWithIngredients,
  getRecipeWithIngredients,
  createRecipe,
  updateRecipe,
  deleteRecipe,
} from '../controllers/recipesController.js';

const router = express.Router();

router.get('/', getRecipes);

router.get('/ingredients', getAllRecipesWithIngredients);

router.get('/ingredients/:id', getRecipeWithIngredients);

router.get('/:id', getRecipeById);

router.post('/', createRecipe);

router.put('/:id', updateRecipe);

router.delete('/:id', deleteRecipe);

export default router;
