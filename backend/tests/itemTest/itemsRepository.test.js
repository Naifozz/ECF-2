process.env.NODE_ENV = 'test';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as itemRepository from '../../src/repositories/itemsRepository.js';
import { openDb } from '../../database/db.js';

describe('Item Repository', () => {
  let db;

  beforeEach(async () => {
    db = await openDb();

    await db.run('DELETE FROM ITEM_RECIPE');
    await db.run('DELETE FROM ITEM_INV');
    await db.run('DELETE FROM RECIPE');
    await db.run('DELETE FROM ITEM');

    const count = await db.get('SELECT COUNT(*) as count FROM ITEM');
    if (count.count > 0) {
      throw new Error(
        `La table ITEM n'est pas vide: ${count.count} items restants`
      );
    }

    await db.run('INSERT INTO ITEM (Name, Image_Path) VALUES (?, ?)', [
      'Bois',
      '/images/bois.png',
    ]);
    await db.run('INSERT INTO ITEM (Name, Image_Path) VALUES (?, ?)', [
      'Pierre',
      '/images/pierre.png',
    ]);

    const checkCount = await db.get('SELECT COUNT(*) as count FROM ITEM');
    if (checkCount.count !== 2) {
      throw new Error(
        `Problème avec les données de test: ${checkCount.count} items présents au lieu de 2`
      );
    }
  });

  afterEach(async () => {
    await db.run('DELETE FROM ITEM_RECIPE');
    await db.run('DELETE FROM ITEM_INV');
    await db.run('DELETE FROM RECIPE');
    await db.run('DELETE FROM ITEM');
    await db.close();
  });

  describe('getItems', () => {
    it('✅ doit retourner tous les items', async () => {
      const items = await itemRepository.getItems();

      expect(items).toHaveLength(2);

      const sortedItems = [...items].sort((a, b) =>
        a.Name.localeCompare(b.Name)
      );
      expect(sortedItems[0].Name).toBe('Bois');
      expect(sortedItems[1].Name).toBe('Pierre');
    });
  });

  describe('getItemById', () => {
    it('✅ doit retourner un item par son ID', async () => {
      const allItems = await db.all('SELECT * FROM ITEM');
      const itemId = allItems.find((item) => item.Name === 'Bois').ID_Item;

      const item = await itemRepository.getItemById(itemId);
      expect(item).not.toBeNull();
      expect(item.Name).toBe('Bois');
      expect(item.Image_Path).toBe('/images/bois.png');
    });

    it('❌ doit retourner undefined pour un ID inexistant', async () => {
      const maxId = await db.get('SELECT MAX(ID_Item) as maxId FROM ITEM');
      const nonExistentId = (maxId.maxId || 0) + 1000;

      const item = await itemRepository.getItemById(nonExistentId);
      expect(item).toBeUndefined();
    });
  });

  describe('createItem', () => {
    it('✅ doit créer un nouvel item', async () => {
      const countBefore = await db.get('SELECT COUNT(*) as count FROM ITEM');
      expect(countBefore.count).toBe(2);

      const newItem = {
        Name: 'Fer',
        Image_Path: '/images/fer.png',
      };

      const createdItem = await itemRepository.createItem(newItem);
      expect(createdItem).not.toBeNull();
      expect(createdItem.Name).toBe('Fer');
      expect(createdItem.Image_Path).toBe('/images/fer.png');

      const countAfter = await db.get('SELECT COUNT(*) as count FROM ITEM');
      expect(countAfter.count).toBe(3);

      const foundItem = await db.get('SELECT * FROM ITEM WHERE Name = ?', [
        'Fer',
      ]);
      expect(foundItem).not.toBeUndefined();
      expect(foundItem.Image_Path).toBe('/images/fer.png');
    });
  });

  describe('updateItem', () => {
    it('✅ doit mettre à jour un item existant', async () => {
      const boisItem = await db.get('SELECT * FROM ITEM WHERE Name = ?', [
        'Bois',
      ]);
      const itemId = boisItem.ID_Item;

      const updatedData = {
        Name: 'Bois Traité',
        Image_Path: '/images/bois_traite.png',
      };

      const updatedItem = await itemRepository.updateItem(itemId, updatedData);
      expect(updatedItem).not.toBeNull();
      expect(updatedItem.Name).toBe('Bois Traité');
      expect(updatedItem.Image_Path).toBe('/images/bois_traite.png');

      const item = await db.get('SELECT * FROM ITEM WHERE ID_Item = ?', [
        itemId,
      ]);
      expect(item.Name).toBe('Bois Traité');
    });

    it("✅ doit retourner undefined si l'item à mettre à jour n'existe pas", async () => {
      const maxId = await db.get('SELECT MAX(ID_Item) as maxId FROM ITEM');
      const nonExistentId = (maxId.maxId || 0) + 1000;

      const updatedData = {
        Name: 'Item Inexistant',
        Image_Path: '/images/inexistant.png',
      };

      const updatedItem = await itemRepository.updateItem(
        nonExistentId,
        updatedData
      );
      expect(updatedItem).toBeUndefined();
    });
  });

  describe('deleteItem', () => {
    it('✅ doit supprimer un item existant', async () => {
      const boisItem = await db.get('SELECT * FROM ITEM WHERE Name = ?', [
        'Bois',
      ]);
      const itemId = boisItem.ID_Item;

      const countBefore = await db.get('SELECT COUNT(*) as count FROM ITEM');
      expect(countBefore.count).toBe(2);

      const result = await itemRepository.deleteItem(itemId);
      expect(result).toBe(1);

      const countAfter = await db.get('SELECT COUNT(*) as count FROM ITEM');
      expect(countAfter.count).toBe(1);

      const remainingItem = await db.get('SELECT * FROM ITEM');
      expect(remainingItem.Name).toBe('Pierre');
    });

    it('❌ doit retourner 0 pour un ID inexistant', async () => {
      const maxId = await db.get('SELECT MAX(ID_Item) as maxId FROM ITEM');
      const nonExistentId = (maxId.maxId || 0) + 1000;

      const result = await itemRepository.deleteItem(nonExistentId);
      expect(result).toBe(0);
    });
  });

  describe('isItemUsedInRecipes', () => {
    it('✅ doit retourner false pour un item non utilisé dans des recettes', async () => {
      const boisItem = await db.get('SELECT * FROM ITEM WHERE Name = ?', [
        'Bois',
      ]);
      const itemId = boisItem.ID_Item;

      const isUsed = await itemRepository.isItemUsedInRecipes(itemId);
      expect(isUsed).toBe(false);
    });

    it('✅ doit retourner true pour un item utilisé dans des recettes', async () => {
      // Créer une recette
      await db.run('INSERT INTO RECIPE (ID_Item_Result) VALUES (?)', [11]);
      const recipe = await db.get(
        'SELECT * FROM RECIPE WHERE ID_Item_Result = ?',
        [11]
      );

      // Associer l'item à la recette
      await db.run(
        'INSERT INTO ITEM_RECIPE (ID_Recipe, ID_Item, Position) VALUES (?, ?, ?)',
        [recipe.ID_Recipe, 7, 4]
      );

      const isUsed = await itemRepository.isItemUsedInRecipes(7);
      expect(isUsed).toBe(true);
    });
  });
});
