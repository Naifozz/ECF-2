import { openDb } from '../../database/db.js';

export async function getUsers() {
    const db = await openDb();
    const users = await db.all('SELECT * FROM USER');
    return users;
}
export async function getUserById(id) {
    const db = await openDb();
    const user = await db.get('SELECT * FROM USER WHERE ID_User = ?', [id]);
    return user;
}

export async function createUser(data) {
    const db = await openDb();
    await db.run('INSERT INTO USER (Pseudo, Email, Password) VALUES (?, ?, ?)', [data.Pseudo, data.Email, data.Password]);
    const result = await db.get('SELECT * FROM USER WHERE ID_User = last_insert_rowid()');
    return result;
}

export async function updateUser(id, data) {
    const db = await openDb();
    await db.run('UPDATE USER SET Pseudo = ?, Email = ?, Password = ? WHERE ID_User = ?', [data.Pseudo, data.Email, data.Password, id]);
    const result = await db.get('SELECT * FROM USER WHERE ID_User = ?', [id]);
    return result;
}

export async function deleteUser(id) {
    const db = await openDb();
    const result = await db.run('DELETE FROM USER WHERE ID_User = ?', [id]);
    return result.changes;
}