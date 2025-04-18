import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  login,
  register,
  logout,
  getCurrentUser,
} from '../../src/controllers/authController.js';
import * as authService from '../../src/services/authService.js';
import * as userService from '../../src/services/usersService.js';

vi.mock('../../src/services/authService.js');
vi.mock('../../src/services/usersService.js');

describe('AuthController', () => {
  let req;
  let res;

  beforeEach(() => {
    vi.resetAllMocks();

    req = {
      body: {},
      session: {},
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
  });

  describe('login', () => {
    it('devrait retourner une erreur 400 si email ou mot de passe manquant', async () => {
      req.body = { email: '' };

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Email et mot de passe requis',
      });
    });

    it('devrait connecter un utilisateur avec des identifiants valides', async () => {
      req.body = { email: 'test@example.com', password: 'password123' };
      const mockUser = { id: 1, email: 'test@example.com', name: 'Test User' };
      authService.login.mockResolvedValue(mockUser);

      await login(req, res);

      expect(authService.login).toHaveBeenCalledWith(
        'test@example.com',
        'password123'
      );
      expect(req.session.user).toEqual(mockUser);
      expect(req.session.isLoggedIn).toBe(true);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Connexion réussie',
        user: mockUser,
      });
    });

    it('devrait gérer les erreurs de service avec un statut spécifique', async () => {
      req.body = { email: 'test@example.com', password: 'password123' };
      const mockError = {
        status: 401,
        message: 'Email ou mot de passe incorrect',
      };
      authService.login.mockRejectedValue(mockError);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Email ou mot de passe incorrect',
      });
    });

    it('devrait gérer les erreurs internes avec un statut 500', async () => {
      req.body = { email: 'test@example.com', password: 'password123' };
      authService.login.mockRejectedValue(new Error('Erreur interne'));

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Erreur lors de la connexion',
      });
    });
  });

  describe('register', () => {
    it('devrait créer un nouvel utilisateur et le connecter', async () => {
      req.body = {
        email: 'new@example.com',
        password: 'newpassword',
        name: 'New User',
      };
      const mockUser = { id: 2, email: 'new@example.com', name: 'New User' };
      userService.createUser.mockResolvedValue(mockUser);

      await register(req, res);

      expect(userService.createUser).toHaveBeenCalledWith(req.body);
      expect(req.session.user).toEqual(mockUser);
      expect(req.session.isLoggedIn).toBe(true);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Inscription réussie',
        user: mockUser,
      });
    });

    it('devrait gérer les erreurs avec un statut spécifique', async () => {
      req.body = { email: 'existing@example.com' };
      const mockError = { status: 409, message: 'Cet email est déjà utilisé' };
      userService.createUser.mockRejectedValue(mockError);

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Cet email est déjà utilisé',
      });
    });
  });

  describe('logout', () => {
    it('devrait détruire la session et retourner un succès', () => {
      req.session.destroy = vi.fn((callback) => callback());

      logout(req, res);

      expect(req.session.destroy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Déconnexion réussie' });
    });

    it('devrait gérer les erreurs de destruction de session', () => {
      req.session.destroy = vi.fn((callback) =>
        callback(new Error('Session error'))
      );

      logout(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Erreur lors de la déconnexion',
      });
    });
  });

  describe('getCurrentUser', () => {
    it("devrait retourner l'utilisateur actuel si connecté", () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      req.session.user = mockUser;
      req.session.isLoggedIn = true;

      getCurrentUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ user: mockUser });
    });

    it('devrait retourner une erreur 401 si non connecté', () => {
      req.session.isLoggedIn = false;

      getCurrentUser(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Non connecté' });
    });
  });
});
