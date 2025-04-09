export async function seedDatabase(db) {
  try {
    const userCount = await db.get('SELECT COUNT(*) as count FROM USER');

    if (userCount.count > 0) {
      console.log('La base de données est déjà peuplée, skip seeding');
      return;
    }

    console.log('Démarrage du seeding de la base de données...');

    const users = [
      {
        pseudo: 'Steve',
        email: 'steve@minecraft.com',
        password: 'password123',
      },
      { pseudo: 'Alex', email: 'alex@minecraft.com', password: 'password456' },
      {
        pseudo: 'Notch',
        email: 'notch@minecraft.com',
        password: 'password789',
      },
    ];

    for (const user of users) {
      const result = await db.run(
        'INSERT INTO USER (Pseudo, Email, Password) VALUES (?, ?, ?)',
        [user.pseudo, user.email, user.password]
      );

      await db.run('INSERT INTO INVENTORY (ID_User) VALUES (?)', [
        result.lastID,
      ]);
    }

    const items = [
      { name: 'Dirt', imagePath: 'images/items/dirt.png' },
      { name: 'Stone', imagePath: 'images/items/stone.png' },
      { name: 'Wood', imagePath: 'images/items/wood.png' },
      { name: 'Diamond', imagePath: 'images/items/diamond.png' },
      { name: 'Iron Ingot', imagePath: 'images/items/iron_ingot.png' },
      { name: 'Coal', imagePath: 'images/items/coal.png' },
      { name: 'Crafting Table', imagePath: 'images/items/crafting_table.png' },
      { name: 'Furnace', imagePath: 'images/items/furnace.png' },
      {
        name: 'Diamond Pickaxe',
        imagePath: 'images/items/diamond_pickaxe.png',
      },
      { name: 'Diamond Sword', imagePath: 'images/items/diamond_sword.png' },
      { name: 'Wooden Planks', imagePath: 'images/items/wooden_planks.png' },
      { name: 'Stick', imagePath: 'images/items/stick.png' },
    ];

    for (const item of items) {
      await db.run('INSERT INTO ITEM (Name, Image_Path) VALUES (?, ?)', [
        item.name,
        item.imagePath,
      ]);
    }

    const itemIds = {};
    const itemRows = await db.all('SELECT ID_Item, Name FROM ITEM');
    for (const row of itemRows) {
      itemIds[row.Name] = row.ID_Item;
    }

    const inventories = await db.all('SELECT ID_Inventory FROM INVENTORY');

    const inventoryItems = [
      {
        inventoryId: inventories[0].ID_Inventory,
        itemId: itemIds['Dirt'],
        quantity: 64,
      },
      {
        inventoryId: inventories[0].ID_Inventory,
        itemId: itemIds['Stone'],
        quantity: 32,
      },
      {
        inventoryId: inventories[0].ID_Inventory,
        itemId: itemIds['Wood'],
        quantity: 16,
      },
      {
        inventoryId: inventories[1].ID_Inventory,
        itemId: itemIds['Diamond'],
        quantity: 5,
      },
      {
        inventoryId: inventories[1].ID_Inventory,
        itemId: itemIds['Iron Ingot'],
        quantity: 20,
      },
      {
        inventoryId: inventories[2].ID_Inventory,
        itemId: itemIds['Diamond Pickaxe'],
        quantity: 1,
      },
      {
        inventoryId: inventories[2].ID_Inventory,
        itemId: itemIds['Diamond Sword'],
        quantity: 1,
      },
      {
        inventoryId: inventories[0].ID_Inventory,
        itemId: itemIds['Stick'],
        quantity: 10,
      },
    ];

    for (const invItem of inventoryItems) {
      try {
        await db.run(
          'INSERT INTO ITEM_INV (ID_Inventory, ID_Item, Quantity) VALUES (?, ?, ?)',
          [invItem.inventoryId, invItem.itemId, invItem.quantity]
        );
      } catch (error) {
        console.error("Erreur lors de l'insertion dans ITEM_INV:", error);
      }
    }

    let craftingTableRecipeResult;
    try {
      craftingTableRecipeResult = await db.run(
        'INSERT INTO RECIPE (ID_Item_Result) VALUES (?)',
        [itemIds['Crafting Table']]
      );
    } catch (error) {
      console.error(
        "Erreur lors de l'insertion dans RECIPE (Crafting Table):",
        error
      );
    }

    let planksRecipeResult;
    try {
      planksRecipeResult = await db.run(
        'INSERT INTO RECIPE (ID_Item_Result) VALUES (?)',
        [itemIds['Wooden Planks']]
      );
    } catch (error) {
      console.error(
        "Erreur lors de l'insertion dans RECIPE (Wooden Planks):",
        error
      );
    }

    let stickRecipeResult;
    try {
      stickRecipeResult = await db.run(
        'INSERT INTO RECIPE (ID_Item_Result) VALUES (?)',
        [itemIds['Stick']]
      );
    } catch (error) {
      console.error("Erreur lors de l'insertion dans RECIPE (Stick):", error);
    }

    let pickaxeRecipeResult;
    try {
      pickaxeRecipeResult = await db.run(
        'INSERT INTO RECIPE (ID_Item_Result) VALUES (?)',
        [itemIds['Diamond Pickaxe']]
      );
    } catch (error) {
      console.error(
        "Erreur lors de l'insertion dans RECIPE (Diamond Pickaxe):",
        error
      );
    }

    const recipeItems = [
      {
        recipe: craftingTableRecipeResult.lastID,
        item: itemIds['Wooden Planks'],
        x: 0,
        y: 0,
      },
      {
        recipe: craftingTableRecipeResult.lastID,
        item: itemIds['Wooden Planks'],
        x: 1,
        y: 0,
      },
      {
        recipe: craftingTableRecipeResult.lastID,
        item: itemIds['Wooden Planks'],
        x: 0,
        y: 1,
      },
      {
        recipe: craftingTableRecipeResult.lastID,
        item: itemIds['Wooden Planks'],
        x: 1,
        y: 1,
      },

      { recipe: planksRecipeResult.lastID, item: itemIds['Wood'], x: 0, y: 0 },

      {
        recipe: stickRecipeResult.lastID,
        item: itemIds['Wooden Planks'],
        x: 0,
        y: 0,
      },
      {
        recipe: stickRecipeResult.lastID,
        item: itemIds['Wooden Planks'],
        x: 0,
        y: 1,
      },

      {
        recipe: pickaxeRecipeResult.lastID,
        item: itemIds['Diamond'],
        x: 0,
        y: 0,
      },
      {
        recipe: pickaxeRecipeResult.lastID,
        item: itemIds['Diamond'],
        x: 1,
        y: 0,
      },
      {
        recipe: pickaxeRecipeResult.lastID,
        item: itemIds['Diamond'],
        x: 2,
        y: 0,
      },
      {
        recipe: pickaxeRecipeResult.lastID,
        item: itemIds['Stick'],
        x: 1,
        y: 1,
      },
      {
        recipe: pickaxeRecipeResult.lastID,
        item: itemIds['Stick'],
        x: 1,
        y: 2,
      },
    ];

    for (const recipeItem of recipeItems) {
      try {
        await db.run(
          'INSERT INTO ITEM_RECIPE (ID_Recipe, ID_Item, position_x, position_y) VALUES (?, ?, ?, ?)',
          [recipeItem.recipe, recipeItem.item, recipeItem.x, recipeItem.y]
        );
      } catch (error) {
        console.error("Erreur lors de l'insertion dans ITEM_RECIPE:", error);
        console.error('Données:', recipeItem);
      }
    }

    console.log('Seeding de la base de données terminé avec succès!');
  } catch (error) {
    console.error('Erreur lors du seeding de la base de données:', error);
    throw error;
  }
}
