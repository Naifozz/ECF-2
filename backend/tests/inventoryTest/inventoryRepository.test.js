process.env.NODE_ENV = 'test';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as inventoryRepository from '../../src/repositories/inventoryRepository.js';
import { openDb } from '../../database/db.js';

describe('Inventory Repository', () => {
  let db;
  let userId;
  let inventoryId;

  beforeEach(async () => {
    db = await openDb();

    await db.run('DELETE FROM ITEM_INV');
    await db.run('DELETE FROM INVENTORY');
    await db.run('DELETE FROM USER');

    await db.run(
      'INSERT INTO USER (Pseudo, Email, Password) VALUES (?, ?, ?)',
      ['TestUser', 'test@example.com', 'password123']
    );

    const user = await db.get('SELECT ID_User FROM USER WHERE Pseudo = ?', [
      'TestUser',
    ]);
    userId = user.ID_User;

    await db.run('INSERT INTO INVENTORY (ID_User) VALUES (?)', [userId]);

    const inventory = await db.get(
      'SELECT ID_Inventory FROM INVENTORY WHERE ID_User = ?',
      [userId]
    );
    inventoryId = inventory.ID_Inventory;

    await db.run('INSERT INTO ITEM (Name, Image_Path) VALUES (?, ?)', [
      'TestItem',
      'images/items/test_item.png',
    ]);

    const item = await db.get('SELECT ID_Item FROM ITEM WHERE Name = ?', [
      'TestItem',
    ]);
    const itemId = item.ID_Item;

    await db.run(
      'INSERT INTO ITEM_INV (ID_Inventory, ID_Item, Quantity) VALUES (?, ?, ?)',
      [inventoryId, itemId, 10]
    );
  });

  afterEach(async () => {
    await db.run('DELETE FROM ITEM_INV');
    await db.run('DELETE FROM INVENTORY');
    await db.run('DELETE FROM USER');
    await db.close();
  });

  describe('getInventoryByUserId', () => {
    it("✅ doit retourner l'inventaire d'un utilisateur par son ID", async () => {
      const inventory = await inventoryRepository.getInventoryByUserId(userId);

      expect(inventory).not.toBeNull();
      expect(inventory).toHaveLength(1);
      expect(inventory[0].ID_User).toBe(userId);
      expect(inventory[0].Quantity).toBe(10);
      expect(inventory[0].Name).toBe('TestItem');
      expect(inventory[0].Image_Path).toBe('images/items/test_item.png');
    });

    it("❌ doit retourner un tableau vide si l'utilisateur n'existe pas", async () => {
      const inventory = await inventoryRepository.getInventoryByUserId(999);
      expect(inventory).toHaveLength(0);
    });
  });

  describe('deleteInventory', () => {
    it("✅ doit supprimer l'inventaire d'un utilisateur par son ID", async () => {
      const result = await inventoryRepository.deleteInventoryByUserId(userId);
      expect(result).toBe(1);

      const inventory = await db.get(
        'SELECT * FROM INVENTORY WHERE ID_User = ?',
        [userId]
      );
      expect(inventory).toBeUndefined();
    });

    it("❌ doit retourner 0 si l'utilisateur n'existe pas", async () => {
      const result = await inventoryRepository.deleteInventoryByUserId(999);
      expect(result).toBe(0);
    });
  });

  describe('createInventory', () => {
    it('✅ doit créer un nouvel inventaire pour un utilisateur', async () => {
      await db.run(
        'INSERT INTO USER (Pseudo, Email, Password) VALUES (?, ?, ?)',
        ['NewUser', 'new@example.com', 'password789']
      );
      const newUser = await db.get(
        'SELECT ID_User FROM USER WHERE Pseudo = ?',
        ['NewUser']
      );

      await db.run('DELETE FROM INVENTORY WHERE ID_User = ?', [
        newUser.ID_User,
      ]);

      const result = await inventoryRepository.createInventory(newUser.ID_User);

      expect(result).not.toBeNull();
      expect(result.ID_User).toBe(newUser.ID_User);

      const inventory = await db.get(
        'SELECT * FROM INVENTORY WHERE ID_User = ?',
        [newUser.ID_User]
      );
      expect(inventory).not.toBeUndefined();
      expect(inventory.ID_User).toBe(newUser.ID_User);
    });
  });
});
