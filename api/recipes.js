import {
  getRecipes,
  getRecipeById,
  getAllRecipesWithIngredients,
  getRecipeWithIngredients,
  createRecipe,
  updateRecipe,
  deleteRecipe,
} from "../backend/src/controllers/recipesController.js";

export default function handler(req, res) {
  const { method, query } = req;

  switch (method) {
    case "GET":
      if (query.id) {
        return getRecipeById(req, res);
      }
      if (query.ingredients && query.id) {
        return getRecipeWithIngredients(req, res);
      }
      if (query.ingredients) {
        return getAllRecipesWithIngredients(req, res);
      }
      return getRecipes(req, res);

    case "POST":
      return createRecipe(req, res);

    case "PUT":
      if (!query.id) {
        return res.status(400).json({ error: "ID is required" });
      }
      return updateRecipe(req, res);

    case "DELETE":
      if (!query.id) {
        return res.status(400).json({ error: "ID is required" });
      }
      return deleteRecipe(req, res);

    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      return res.status(405).end(`Method ${method} is not allowed`);
  }
}
