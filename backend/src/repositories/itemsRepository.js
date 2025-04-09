import { openDb } from '../../database/db.js';

export async function getItems() {
  const db = await openDb();
  const items = await db.all('SELECT * FROM ITEM');
  return items;
}

export async function getItemById(id) {
  const db = await openDb();
  const item = await db.get('SELECT * FROM ITEM WHERE ID_Item = ?', [id]);
  return item;
}
export async function createItem(data) {
  const db = await openDb();
  await db.run('INSERT INTO ITEM (Name, Image_Path) VALUES (?, ?)', [
    data.Name,
    data.Image_Path,
  ]);
  const result = await db.get(
    'SELECT * FROM ITEM WHERE ID_Item = last_insert_rowid()'
  );
  return result;
}

export async function updateItem(id, data) {
  const db = await openDb();
  await db.run('UPDATE ITEM SET Name = ?, Image_Path = ? WHERE ID_Item = ?', [
    data.Name,
    data.Image_Path,
    id,
  ]);
  const result = await db.get('SELECT * FROM ITEM WHERE ID_Item = ?', [id]);
  return result;
}
export async function deleteItem(id) {
  const db = await openDb();
  const result = await db.run('DELETE FROM ITEM WHERE ID_Item = ?', [id]);
  return result.changes;
}

export async function isItemUsedInRecipes(id) {
  const db = await openDb();
  const count = await db.get(
    'SELECT COUNT(*) as count FROM ITEM_RECIPE WHERE ID_Item = ?',
    [id]
  );
  return count.count > 0;
}
