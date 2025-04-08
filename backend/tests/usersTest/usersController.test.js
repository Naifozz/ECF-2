process.env.NODE_ENV = 'test';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as userService from '../../src/services/usersService.js';
import * as userController from '../../src/controllers/usersController.js';

vi.mock('../../src/services/usersService.js');

describe('Users Controllers', () => {
  let req, res;

  beforeEach(() => {
    vi.resetAllMocks();

    req = {
      params: {},
      body: {},
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };
  });

  describe('getUsers', () => {
    it('✅ doit retourner tous les utilisateurs avec un statut 200', async () => {
      const mockUsers = [
        { ID_User: 1, Pseudo: 'User1', Email: 'user1@example.com' },
        { ID_User: 2, Pseudo: 'User2', Email: 'user2@example.com' },
      ];

      userService.getUsers.mockResolvedValue(mockUsers);

      await userController.getUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUsers);
    });

    it('❌ doit gérer les erreurs et retourner un statut 500', async () => {
      const error = new Error('Erreur de base de données');
      userService.getUsers.mockRejectedValue(error);

      await userController.getUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Erreur lors de la récupération des utilisateurs',
      });
    });
  });

  describe('getUserById', () => {
    it('✅ doit retourner un utilisateur par son ID avec un statut 200', async () => {
      const mockUser = {
        ID_User: 1,
        Pseudo: 'User1',
        Email: 'user1@example.com',
      };
      userService.getUserById.mockResolvedValue(mockUser);

      req.params.id = '1';

      await userController.getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it("❌ doit retourner un statut 404 quand l'utilisateur n'existe pas", async () => {
      const errorMessage = "Utilisateur avec l'ID 999 introuvable";
      const error = { status: 404, message: errorMessage };
      userService.getUserById.mockRejectedValue(error);

      req.params.id = '999';

      await userController.getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: errorMessage,
      });
    });

    it('❌ doit retourner un statut 500 pour les erreurs génériques', async () => {
      const error = new Error('Erreur interne');
      userService.getUserById.mockRejectedValue(error);

      req.params.id = '1';

      await userController.getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Erreur lors de la récupération de l'utilisateur",
      });
    });
  });

  describe('createUser', () => {
    it('✅ doit créer un utilisateur et retourner un statut 201', async () => {
      const userData = {
        Pseudo: 'NewUser',
        Email: 'new@example.com',
        Password: 'password123',
      };

      const createdUser = { ID_User: 3, ...userData };

      req.body = userData;
      userService.createUser.mockResolvedValue(createdUser);

      await userController.createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(createdUser);
    });

    it('❌ doit retourner un statut 500 pour les erreurs de validation', async () => {
      const validationErrors = [
        'Le pseudo est requis',
        "L'email doit être valide",
      ];
      const error = {
        status: 400,
        message: validationErrors,
      };

      userService.createUser.mockRejectedValue(error);

      req.body = {
        Pseudo: '',
        Email: 'invalid-email',
        Password: 'pass',
      };

      await userController.createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: `Erreur lors de la création de l'utilisateur ${error.message}`,
      });
    });

    it('❌ doit retourner un statut 500 pour les erreurs serveur', async () => {
      const error = new Error('Erreur de base de données');
      userService.createUser.mockRejectedValue(error);

      req.body = {
        Pseudo: 'User',
        Email: 'user@example.com',
        Password: 'password',
      };

      await userController.createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: `Erreur lors de la création de l'utilisateur ${error.message}`,
      });
    });
  });

  describe('updateUser', () => {
    it('✅ doit mettre à jour un utilisateur et retourner un statut 200', async () => {
      const userData = {
        Pseudo: 'UpdatedUser',
        Email: 'updated@example.com',
        Password: 'newpassword',
      };

      const updatedUser = { ID_User: 1, ...userData };

      req.params.id = '1';
      req.body = userData;
      userService.updateUser.mockResolvedValue(updatedUser);

      await userController.updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedUser);
    });

    it("❌ doit retourner un statut 404 quand l'utilisateur à mettre à jour n'existe pas", async () => {
      const errorMessage = "Utilisateur avec l'ID 999 introuvable";
      const error = { status: 404, message: errorMessage };

      userService.updateUser.mockRejectedValue(error);

      req.params.id = '999';
      req.body = {
        Pseudo: 'ValidUser',
        Email: 'valid@example.com',
        Password: 'validpassword',
      };

      await userController.updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: errorMessage,
      });
    });

    it('❌ doit retourner un statut 500 pour les erreurs de validation et autres erreurs', async () => {
      const validationErrors = ['Le pseudo est requis'];
      const error = {
        status: 400,
        message: validationErrors,
      };

      userService.updateUser.mockRejectedValue(error);

      req.params.id = '1';
      req.body = {
        Pseudo: '',
        Email: 'valid@example.com',
        Password: 'validpassword',
      };

      await userController.updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: `Erreur lors de la mise à jour de l'utilisateur ${error.message}`,
      });
    });
  });

  describe('deleteUser', () => {
    it('✅ doit supprimer un utilisateur et retourner un statut 200', async () => {
      userService.deleteUser.mockResolvedValue(1);

      req.params.id = '1';

      await userController.deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(1);
    });

    it("❌ doit retourner un statut 404 quand l'utilisateur à supprimer n'existe pas", async () => {
      const errorMessage = "Utilisateur avec l'ID 999 introuvable";
      const error = { status: 404, message: errorMessage };

      userService.deleteUser.mockRejectedValue(error);

      req.params.id = '999';

      await userController.deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: errorMessage,
      });
    });

    it('❌ doit retourner un statut 500 pour les erreurs serveur', async () => {
      const error = new Error('Erreur de base de données');
      userService.deleteUser.mockRejectedValue(error);

      req.params.id = '1';

      await userController.deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Erreur lors de la suppression de l'utilisateur",
      });
    });
  });
});
