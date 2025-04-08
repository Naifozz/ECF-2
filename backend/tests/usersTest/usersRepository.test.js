process.env.NODE_ENV = 'test';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as userRepository from '../../src/repositories/usersRepository.js';
import { openDb } from '../../database/db.js';

describe('Users Repository', () => {
  let db;

  beforeEach(async () => {
    db = await openDb();
    await db.run('DELETE FROM USER');
    await db.run(
      'INSERT INTO USER (Pseudo, Email, Password) VALUES (?, ?, ?)',
      ['TestUser1', 'test1@example.com', 'password123']
    );
    await db.run(
      'INSERT INTO USER (Pseudo, Email, Password) VALUES (?, ?, ?)',
      ['TestUser2', 'test2@example.com', 'password456']
    );
  });

  afterEach(async () => {
    await db.run('DELETE FROM USER');
    await db.close();
  });

  describe('getUsers', () => {
    it('✅ doit retourner tous les utilisateurs', async () => {
      const users = await userRepository.getUsers();
      expect(users).toHaveLength(2);
      expect(users[0].Pseudo).toBe('TestUser1');
      expect(users[1].Pseudo).toBe('TestUser2');
    });
  });

  describe('getUserById', () => {
    it('✅ doit retourner un utilisateur par son ID', async () => {
      const allUsers = await db.all('SELECT * FROM USER');
      const userId = allUsers[0].ID_User;

      const user = await userRepository.getUserById(userId);
      expect(user).not.toBeNull();
      expect(user.Pseudo).toBe('TestUser1');
      expect(user.Email).toBe('test1@example.com');
    });

    it('❌ doit retourner undefined pour un ID inexistant', async () => {
      const user = await userRepository.getUserById(999);
      expect(user).toBeUndefined();
    });
  });

  describe('createUser', () => {
    it('✅ doit créer un nouvel utilisateur', async () => {
      const newUser = {
        Pseudo: 'NewUser',
        Email: 'new@example.com',
        Password: 'newpassword',
      };

      const createdUser = await userRepository.createUser(newUser);
      expect(createdUser).not.toBeNull();
      expect(createdUser.Pseudo).toBe('NewUser');
      expect(createdUser.Email).toBe('new@example.com');

      const allUsers = await db.all('SELECT * FROM USER');
      expect(allUsers).toHaveLength(3);
    });
  });

  describe('updateUser', () => {
    it('✅ doit mettre à jour un utilisateur existant', async () => {
      const allUsers = await db.all('SELECT * FROM USER');
      const userId = allUsers[0].ID_User;

      const updatedData = {
        Pseudo: 'UpdatedUser',
        Email: 'updated@example.com',
        Password: 'updatedpassword',
      };

      const updatedUser = await userRepository.updateUser(userId, updatedData);
      expect(updatedUser).not.toBeNull();
      expect(updatedUser.Pseudo).toBe('UpdatedUser');
      expect(updatedUser.Email).toBe('updated@example.com');

      const user = await db.get('SELECT * FROM USER WHERE ID_User = ?', [
        userId,
      ]);
      expect(user.Pseudo).toBe('UpdatedUser');
    });

    it("✅ doit retourner undefined si l'utilisateur à mettre à jour n'existe pas", async () => {
      const updatedData = {
        Pseudo: 'NonExistentUser',
        Email: 'nonexistent@example.com',
        Password: 'password',
      };

      const updatedUser = await userRepository.updateUser(999, updatedData);
      expect(updatedUser).toBeUndefined();
    });
  });

  describe('deleteUser', () => {
    it('✅ doit supprimer un utilisateur existant', async () => {
      const allUsers = await db.all('SELECT * FROM USER');
      const userId = allUsers[0].ID_User;

      const result = await userRepository.deleteUser(userId);
      expect(result).toBe(1);

      const remainingUsers = await db.all('SELECT * FROM USER');
      expect(remainingUsers).toHaveLength(1);
      expect(remainingUsers[0].Pseudo).toBe('TestUser2');
    });

    it('❌ doit retourner 0 pour un ID inexistant', async () => {
      const result = await userRepository.deleteUser(999);
      expect(result).toBe(0);
    });
  });
});
