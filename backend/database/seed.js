export async function seedDatabase(db) {
  try {
    const userCount = await db.get('SELECT COUNT(*) as count FROM USER');
    const recipeCount = await db.get('SELECT COUNT(*) as count FROM RECIPE');

    if (userCount.count > 0 && recipeCount.count > 0) {
      console.log('La base de données est déjà peuplée, skip seeding');
      return;
    }

    console.log('Démarrage du seeding de la base de données...');

    if (userCount.count === 0) {
      await seedUsers(db);
    }

    const itemIds = await seedItems(db);
    await seedInventoryItems(db, itemIds);
    await seedRecipes(db, itemIds);

    console.log('Seeding de la base de données terminé avec succès!');
  } catch (error) {
    console.error('Erreur lors du seeding de la base de données:', error);
    throw error;
  }
}

async function seedUsers(db) {
  const users = [
    {
      pseudo: 'Steve',
      email: 'steve@minecraft.com',
      password: 'password123',
    },
    {
      pseudo: 'Alex',
      email: 'alex@minecraft.com',
      password: 'password456',
    },
    {
      pseudo: 'Notch',
      email: 'notch@minecraft.com',
      password: 'password789',
    },
  ];

  for (const user of users) {
    const existingUser = await db.get(
      'SELECT ID_User FROM USER WHERE Email = ?',
      [user.email]
    );

    let userId;
    if (!existingUser) {
      const result = await db.run(
        'INSERT INTO USER (Pseudo, Email, Password) VALUES (?, ?, ?)',
        [user.pseudo, user.email, user.password]
      );
      userId = result.lastID;
    } else {
      userId = existingUser.ID_User;
    }

    const existingInventory = await db.get(
      'SELECT ID_Inventory FROM INVENTORY WHERE ID_User = ?',
      [userId]
    );

    if (!existingInventory) {
      await db.run('INSERT INTO INVENTORY (ID_User) VALUES (?)', [userId]);
    }
  }

  console.log('Utilisateurs et inventaires ajoutés avec succès');
}

async function seedItems(db) {
  const items = [
    { name: 'Dirt', imagePath: 'images/items/dirt.png' },
    { name: 'Stone', imagePath: 'images/items/stone.png' },
    { name: 'Wood', imagePath: 'images/items/wood.png' },
    { name: 'Diamond', imagePath: 'images/items/diamond.png' },
    { name: 'Iron Ingot', imagePath: 'images/items/iron_ingot.png' },
    { name: 'Coal', imagePath: 'images/items/coal.png' },
    { name: 'Crafting Table', imagePath: 'images/items/crafting_table.png' },
    { name: 'Furnace', imagePath: 'images/items/furnace.png' },
    { name: 'Diamond Pickaxe', imagePath: 'images/items/diamond_pickaxe.png' },
    { name: 'Diamond Sword', imagePath: 'images/items/diamond_sword.png' },
    { name: 'Wooden Planks', imagePath: 'images/items/wooden_planks.png' },
    { name: 'Stick', imagePath: 'images/items/stick.png' },
  ];

  const itemIds = {};

  for (const item of items) {
    const existingItem = await db.get(
      'SELECT ID_Item FROM ITEM WHERE Name = ?',
      [item.name]
    );

    if (!existingItem) {
      const result = await db.run(
        'INSERT INTO ITEM (Name, Image_Path) VALUES (?, ?)',
        [item.name, item.imagePath]
      );
      itemIds[item.name] = result.lastID;
    } else {
      itemIds[item.name] = existingItem.ID_Item;
    }
  }

  console.log('Items ajoutés avec succès');
  return itemIds;
}

async function seedInventoryItems(db, itemIds) {
  const inventories = await db.all(
    'SELECT ID_Inventory, ID_User FROM INVENTORY'
  );

  const inventoryItems = [
    { userId: 1, itemName: 'Dirt', quantity: 64 },
    { userId: 1, itemName: 'Stone', quantity: 32 },
    { userId: 1, itemName: 'Wood', quantity: 16 },
    { userId: 1, itemName: 'Stick', quantity: 10 },
    { userId: 2, itemName: 'Diamond', quantity: 5 },
    { userId: 2, itemName: 'Iron Ingot', quantity: 20 },
    { userId: 3, itemName: 'Diamond Pickaxe', quantity: 1 },
    { userId: 3, itemName: 'Diamond Sword', quantity: 1 },
  ];

  for (const invItem of inventoryItems) {
    const inventory = inventories.find((inv) => inv.ID_User === invItem.userId);
    if (!inventory) continue;

    const existingInvItem = await db.get(
      'SELECT ID_Inventory FROM ITEM_INV WHERE ID_Inventory = ? AND ID_Item = ?',
      [inventory.ID_Inventory, itemIds[invItem.itemName]]
    );

    if (!existingInvItem) {
      try {
        await db.run(
          'INSERT INTO ITEM_INV (ID_Inventory, ID_Item, Quantity) VALUES (?, ?, ?)',
          [inventory.ID_Inventory, itemIds[invItem.itemName], invItem.quantity]
        );
      } catch (error) {
        console.error(
          `Erreur lors de l'insertion de ${invItem.itemName} dans l'inventaire:`,
          error
        );
      }
    }
  }

  console.log("Items d'inventaire ajoutés avec succès");
}

async function seedRecipes(db, itemIds) {
  const recipes = [
    {
      resultItem: 'Crafting Table',
      ingredients: [
        { itemName: 'Wooden Planks', position: 1 },
        { itemName: 'Wooden Planks', position: 2 },
        { itemName: 'Wooden Planks', position: 4 },
        { itemName: 'Wooden Planks', position: 5 },
      ],
    },
    {
      resultItem: 'Wooden Planks',
      ingredients: [{ itemName: 'Wood', position: 1 }],
    },
    {
      resultItem: 'Stick',
      ingredients: [
        { itemName: 'Wooden Planks', position: 1 },
        { itemName: 'Wooden Planks', position: 4 },
      ],
    },
    {
      resultItem: 'Diamond Pickaxe',
      ingredients: [
        { itemName: 'Diamond', position: 1 },
        { itemName: 'Diamond', position: 2 },
        { itemName: 'Diamond', position: 3 },
        { itemName: 'Stick', position: 5 },
        { itemName: 'Stick', position: 8 },
      ],
    },
  ];

  for (const recipe of recipes) {
    const existingRecipe = await db.get(
      'SELECT ID_Recipe FROM RECIPE WHERE ID_Item_Result = ?',
      [itemIds[recipe.resultItem]]
    );

    let recipeId;
    if (!existingRecipe) {
      try {
        const result = await db.run(
          'INSERT INTO RECIPE (ID_Item_Result) VALUES (?)',
          [itemIds[recipe.resultItem]]
        );
        recipeId = result.lastID;
        console.log(
          `Recette pour ${recipe.resultItem} ajoutée avec succès (ID: ${recipeId})`
        );
      } catch (error) {
        console.error(
          `Erreur lors de l'insertion de la recette pour ${recipe.resultItem}:`,
          error
        );
        continue;
      }
    } else {
      recipeId = existingRecipe.ID_Recipe;
      console.log(
        `Recette pour ${recipe.resultItem} existe déjà (ID: ${recipeId})`
      );
    }

    for (const ingredient of recipe.ingredients) {
      const existingIngredient = await db.get(
        'SELECT ID_Item_Recipe FROM ITEM_RECIPE WHERE ID_Recipe = ? AND ID_Item = ? AND Position = ?',
        [recipeId, itemIds[ingredient.itemName], ingredient.position]
      );

      if (!existingIngredient) {
        try {
          await db.run(
            'INSERT INTO ITEM_RECIPE (ID_Recipe, ID_Item, Position) VALUES (?, ?, ?)',
            [recipeId, itemIds[ingredient.itemName], ingredient.position]
          );
        } catch (error) {
          console.error(
            `Erreur lors de l'insertion de l'ingrédient ${ingredient.itemName} pour la recette ${recipe.resultItem}:`,
            error
          );
        }
      }
    }
  }

  console.log('Recettes et ingrédients ajoutés avec succès');
}
