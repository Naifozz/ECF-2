import { openDb } from '../../database/db.js';

export async function getRecipes() {
  const db = await openDb();
  const recipes = await db.all('SELECT * FROM RECIPE');
  return recipes;
}

export async function getRecipeById(id) {
  const db = await openDb();
  const recipe = await db.get('SELECT * FROM RECIPE WHERE ID_Recipe = ?', [id]);
  return recipe;
}

export async function getRecipesWithIngredients() {
  const db = await openDb();
  const recipes = await db.all(
    `SELECT r.*, i.ID_Item, i.Name, ir.Position
     FROM RECIPE r
     JOIN ITEM_RECIPE ir ON r.ID_Recipe = ir.ID_Recipe
     JOIN ITEM i ON ir.ID_Item = i.ID_Item`
  );
  return recipes;
}

export async function getRecipeWithIngredients(id) {
  const db = await openDb();

  // Vérifier si la recette existe
  const recipe = await db.get('SELECT * FROM RECIPE WHERE ID_Recipe = ?', [id]);
  if (!recipe) {
    return undefined;
  }

  // Récupérer les informations du résultat (l'item résultant)
  const resultItem = await db.get(
    `SELECT i.* 
     FROM RECIPE r
     JOIN ITEM i ON r.ID_Item_Result = i.ID_Item
     WHERE r.ID_Recipe = ?`,
    [id]
  );

  // Récupérer les ingrédients
  const ingredients = await db.all(
    `SELECT ir.ID_Item, ir.Position, i.Name, i.Image_Path 
     FROM ITEM_RECIPE ir
     JOIN ITEM i ON ir.ID_Item = i.ID_Item
     WHERE ir.ID_Recipe = ?
     ORDER BY ir.Position`,
    [id]
  );

  // Formater le résultat selon la structure attendue
  return {
    ID_Recipe: recipe.ID_Recipe,
    ID_Item_Result: recipe.ID_Item_Result,
    Result: resultItem,
    Ingredients: ingredients,
  };
}

export async function createRecipe(recipe) {
  const db = await openDb();
  const result = await db.run(
    'INSERT INTO RECIPE (ID_Item_Result) VALUES (?)',
    [recipe.ID_Item_Result]
  );
  const recipeId = result.lastID;

  // Insérer les ingrédients
  for (const ingredient of recipe.Ingredients) {
    await db.run(
      'INSERT INTO ITEM_RECIPE (ID_Recipe, ID_Item, Position) VALUES (?, ?, ?)',
      [recipeId, ingredient.ID_Item, ingredient.Position]
    );
  }

  // Récupérer les données complètes de la recette avec les ingrédients
  const recipeData = await db.get('SELECT * FROM RECIPE WHERE ID_Recipe = ?', [
    recipeId,
  ]);

  // Récupérer les ingrédients avec leurs informations
  const ingredients = await db.all(
    `SELECT ir.ID_Item, ir.Position, i.Name, i.Image_Path 
     FROM ITEM_RECIPE ir
     JOIN ITEM i ON ir.ID_Item = i.ID_Item
     WHERE ir.ID_Recipe = ?
     ORDER BY ir.Position`,
    [recipeId]
  );

  return {
    ...recipeData,
    Ingredients: ingredients,
  };
}

export async function updateRecipe(id, recipe) {
  const db = await openDb();

  // Vérifier si la recette existe
  const existingRecipe = await db.get(
    'SELECT * FROM RECIPE WHERE ID_Recipe = ?',
    [id]
  );
  if (!existingRecipe) {
    return undefined;
  }

  // Mettre à jour la recette
  await db.run('UPDATE RECIPE SET ID_Item_Result = ? WHERE ID_Recipe = ?', [
    recipe.ID_Item_Result,
    id,
  ]);

  // Supprimer les anciens ingrédients
  await db.run('DELETE FROM ITEM_RECIPE WHERE ID_Recipe = ?', [id]);

  // Ajouter les nouveaux ingrédients
  for (const ingredient of recipe.Ingredients) {
    await db.run(
      'INSERT INTO ITEM_RECIPE (ID_Recipe, ID_Item, Position) VALUES (?, ?, ?)',
      [id, ingredient.ID_Item, ingredient.Position]
    );
  }

  const recipeData = await db.get(
    'SELECT r.* FROM RECIPE r WHERE ID_Recipe = ?',
    [id]
  );

  const ingredients = await db.all(
    `SELECT ir.ID_Item, ir.Position, i.Name, i.Image_Path 
     FROM ITEM_RECIPE ir
     JOIN ITEM i ON ir.ID_Item = i.ID_Item
     WHERE ir.ID_Recipe = ?
     ORDER BY ir.Position`,
    [id]
  );

  return {
    ...recipeData,
    Ingredients: ingredients,
  };
}

export async function deleteRecipe(id) {
  const db = await openDb();
  await db.run('DELETE FROM ITEM_RECIPE WHERE ID_Recipe = ?', [id]);
  const result = await db.run('DELETE FROM RECIPE WHERE ID_Recipe = ?', [id]);
  return result.changes;
}
