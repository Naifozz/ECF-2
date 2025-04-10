process.env.NODE_ENV = 'test';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as userService from '../../src/services/usersService.js';
import * as userRepository from '../../src/repositories/usersRepository.js';
import * as inventoryRepository from '../../src/repositories/inventoryRepository.js';
import { validateUser, hashPassword } from '../../src/models/usersModel.js';

vi.mock('../../src/repositories/usersRepository.js');
vi.mock('../../src/repositories/inventoryRepository.js');
vi.mock('../../src/models/usersModel.js');

describe('Users Service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getUsers', () => {
    it('✅ doit retourner tous les utilisateurs', async () => {
      const mockUsers = [
        {
          ID_User: 1,
          Pseudo: 'User1',
          Email: 'user1@example.com',
          Password: 'pass1',
        },
        {
          ID_User: 2,
          Pseudo: 'User2',
          Email: 'user2@example.com',
          Password: 'pass2',
        },
      ];

      userRepository.getUsers.mockResolvedValue(mockUsers);

      const result = await userService.getUsers();
      expect(result).toEqual(mockUsers);
      expect(userRepository.getUsers).toHaveBeenCalledTimes(1);
    });

    it('❌ doit lancer une erreur en cas de problème', async () => {
      const mockError = new Error('Database error');
      userRepository.getUsers.mockRejectedValue(mockError);

      await expect(userService.getUsers()).rejects.toThrow();
    });
  });

  describe('getUserById', () => {
    it('✅ doit retourner un utilisateur par son ID', async () => {
      const mockUser = {
        ID_User: 1,
        Pseudo: 'User1',
        Email: 'user1@example.com',
        Password: 'pass1',
      };
      userRepository.getUserById.mockResolvedValue(mockUser);

      const result = await userService.getUserById(1);
      expect(result).toEqual(mockUser);
      expect(userRepository.getUserById).toHaveBeenCalledWith(1);
    });

    it("❌ doit lancer une erreur si l'utilisateur n'existe pas", async () => {
      userRepository.getUserById.mockResolvedValue(null);

      await expect(userService.getUserById(999)).rejects.toEqual(
        expect.objectContaining({
          status: 404,
          message: "Utilisateur avec l'ID 999 introuvable",
        })
      );
    });
  });

  describe('createUser', () => {
    it('✅ doit créer un utilisateur avec des données valides', async () => {
      const userData = {
        Pseudo: 'NewUser',
        Email: 'new@example.com',
        Password: 'password123',
      };

      const hashedPassword = 'hashed_password123';

      validateUser.mockReturnValue({ isValid: true, errors: [] });
      userRepository.getUserByEmail.mockResolvedValue(null);
      hashPassword.mockResolvedValue(hashedPassword);

      const createdUser = {
        ID_User: 3,
        Pseudo: 'NewUser',
        Email: 'new@example.com',
        Password: hashedPassword,
      };
      userRepository.createUser.mockResolvedValue(createdUser);

      inventoryRepository.createInventory.mockResolvedValue({
        ID_Inventory: 1,
        ID_User: 3,
      });

      const result = await userService.createUser(userData);

      // Vérifier que le password n'est pas retourné
      expect(result).toEqual({
        ID_User: 3,
        Pseudo: 'NewUser',
        Email: 'new@example.com',
      });

      expect(validateUser).toHaveBeenCalledWith(userData);
      expect(userRepository.getUserByEmail).toHaveBeenCalledWith(
        'new@example.com'
      );
      expect(hashPassword).toHaveBeenCalledWith('password123');
      expect(userRepository.createUser).toHaveBeenCalledWith({
        ...userData,
        Password: hashedPassword,
      });
      expect(inventoryRepository.createInventory).toHaveBeenCalledWith(3);
    });

    it('❌ doit lancer une erreur pour des données invalides', async () => {
      const invalidData = {
        Pseudo: 'ab',
        Email: 'invalid-email',
        Password: '123',
      };

      validateUser.mockReturnValue({
        isValid: false,
        errors: [
          'Le pseudo doit contenir au moins 3 caractères',
          "L'email doit être valide",
          'Le mot de passe doit contenir au moins 6 caractères',
        ],
      });

      await expect(userService.createUser(invalidData)).rejects.toEqual(
        expect.objectContaining({
          status: 400,
          message: expect.arrayContaining([
            'Le pseudo doit contenir au moins 3 caractères',
            "L'email doit être valide",
            'Le mot de passe doit contenir au moins 6 caractères',
          ]),
        })
      );

      expect(userRepository.getUserByEmail).not.toHaveBeenCalled();
      expect(hashPassword).not.toHaveBeenCalled();
      expect(userRepository.createUser).not.toHaveBeenCalled();
      expect(inventoryRepository.createInventory).not.toHaveBeenCalled();
    });

    it("❌ doit lancer une erreur si l'email existe déjà", async () => {
      const userData = {
        Pseudo: 'NewUser',
        Email: 'existing@example.com',
        Password: 'password123',
      };

      validateUser.mockReturnValue({ isValid: true, errors: [] });
      userRepository.getUserByEmail.mockResolvedValue({
        ID_User: 5,
        Pseudo: 'ExistingUser',
        Email: 'existing@example.com',
      });

      await expect(userService.createUser(userData)).rejects.toEqual(
        expect.objectContaining({
          status: 400,
          message: 'Cet email est déjà utilisé',
        })
      );

      expect(hashPassword).not.toHaveBeenCalled();
      expect(userRepository.createUser).not.toHaveBeenCalled();
      expect(inventoryRepository.createInventory).not.toHaveBeenCalled();
    });
  });

  describe('updateUser', () => {
    it('✅ doit mettre à jour un utilisateur avec des données valides', async () => {
      const userData = {
        Pseudo: 'UpdatedUser',
        Email: 'updated@example.com',
        Password: 'updatedpass',
      };

      validateUser.mockReturnValue({ isValid: true, errors: [] });
      userRepository.getUserById.mockResolvedValue({
        ID_User: 1,
        Pseudo: 'OldUser',
        Email: 'old@example.com',
        Password: 'oldpass',
      });

      const updatedUser = { ID_User: 1, ...userData };
      userRepository.updateUser.mockResolvedValue(updatedUser);

      const result = await userService.updateUser(1, userData);
      expect(result).toEqual(updatedUser);
      expect(userRepository.getUserById).toHaveBeenCalledWith(1);
      expect(validateUser).toHaveBeenCalledWith(userData);
      expect(userRepository.updateUser).toHaveBeenCalledWith(1, userData);
    });

    it("❌ doit lancer une erreur si l'utilisateur n'existe pas", async () => {
      userRepository.getUserById.mockResolvedValue(null);

      const userData = {
        Pseudo: 'UpdatedUser',
        Email: 'updated@example.com',
        Password: 'updatedpass',
      };

      await expect(userService.updateUser(999, userData)).rejects.toEqual(
        expect.objectContaining({
          status: 404,
          message: "Utilisateur avec l'ID 999 introuvable",
        })
      );

      expect(validateUser).not.toHaveBeenCalled();
      expect(userRepository.updateUser).not.toHaveBeenCalled();
    });

    it('❌ doit lancer une erreur pour des données invalides', async () => {
      const invalidData = {
        Pseudo: '',
        Email: 'test@example.com',
        Password: 'password',
      };

      userRepository.getUserById.mockResolvedValue({
        ID_User: 1,
        Pseudo: 'OldUser',
        Email: 'old@example.com',
        Password: 'oldpass',
      });
      validateUser.mockReturnValue({
        isValid: false,
        errors: ['Le pseudo est requis'],
      });

      await expect(userService.updateUser(1, invalidData)).rejects.toEqual(
        expect.objectContaining({
          status: 400,
          message: ['Le pseudo est requis'],
        })
      );

      expect(userRepository.updateUser).not.toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    it('✅ doit supprimer un utilisateur existant', async () => {
      userRepository.getUserById.mockResolvedValue({
        ID_User: 1,
        Pseudo: 'User1',
        Email: 'user1@example.com',
        Password: 'pass1',
      });
      userRepository.deleteUser.mockResolvedValue(1);

      inventoryRepository.deleteInventoryByUserId.mockResolvedValue(1);

      const result = await userService.deleteUser(1);
      expect(result).toBe(1);
      expect(userRepository.getUserById).toHaveBeenCalledWith(1);
      expect(inventoryRepository.deleteInventoryByUserId).toHaveBeenCalledWith(
        1
      );
      expect(userRepository.deleteUser).toHaveBeenCalledWith(1);
    });

    it("❌ doit lancer une erreur si l'utilisateur n'existe pas", async () => {
      userRepository.getUserById.mockResolvedValue(null);

      await expect(userService.deleteUser(999)).rejects.toEqual(
        expect.objectContaining({
          status: 404,
          message: "Utilisateur avec l'ID 999 introuvable",
        })
      );

      expect(userRepository.deleteUser).not.toHaveBeenCalled();
      expect(
        inventoryRepository.deleteInventoryByUserId
      ).not.toHaveBeenCalled();
    });
  });
});
