import { openDb } from '../../database/db.js';

export async function getInventoryByUserId(userId) {
  const db = await openDb();
  const inventory = await db.all(
    `SELECT i.ID_Inventory, i.ID_User, ii.ID_Item, it.Name, it.Image_Path, ii.Quantity
       FROM INVENTORY i
       JOIN ITEM_INV ii ON i.ID_Inventory = ii.ID_Inventory
       JOIN ITEM it ON ii.ID_Item = it.ID_Item
       WHERE i.ID_User = ?`,
    [userId]
  );
  return inventory;
}

export async function deleteInventoryByUserId(userId) {
  const db = await openDb();
  const result = await db.run('DELETE FROM INVENTORY WHERE ID_User = ?', [
    userId,
  ]);
  return result.changes;
}
export async function createInventory(userId) {
  const db = await openDb();
  await db.run('INSERT INTO INVENTORY (ID_User) VALUES (?)', [userId]);
  const result = await db.get(
    'SELECT * FROM INVENTORY WHERE ID_Inventory = last_insert_rowid()'
  );
  return result;
}
