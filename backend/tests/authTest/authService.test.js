import { describe, it, expect, vi, beforeEach } from 'vitest';
import { login } from '../../src/services/authService.js';
import * as userRepository from '../../src/repositories/usersRepository.js';
import { comparePassword } from '../../src/models/usersModel.js';

vi.mock('../../src/repositories/usersRepository.js');
vi.mock('../../src/models/usersModel.js');

describe('AuthService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('login', () => {
    it('devrait retourner un utilisateur avec des identifiants valides', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        Password: 'hashedPassword',
      };

      userRepository.getUserByEmail.mockResolvedValue(mockUser);
      comparePassword.mockResolvedValue(true);

      const result = await login(email, password);

      expect(userRepository.getUserByEmail).toHaveBeenCalledWith(email);
      expect(comparePassword).toHaveBeenCalledWith(password, mockUser.Password);
      expect(result).toEqual({
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
      });
      expect(result.Password).toBeUndefined();
    });

    it("devrait lancer une erreur si l'utilisateur n'existe pas", async () => {
      const email = 'nonexistent@example.com';
      const password = 'password123';

      userRepository.getUserByEmail.mockResolvedValue(null);

      await expect(login(email, password)).rejects.toEqual({
        status: 401,
        message: 'Email ou mot de passe incorrect',
      });
      expect(comparePassword).not.toHaveBeenCalled();
    });

    it('devrait lancer une erreur si le mot de passe est incorrect', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        Password: 'hashedPassword',
      };

      userRepository.getUserByEmail.mockResolvedValue(mockUser);
      comparePassword.mockResolvedValue(false);

      await expect(login(email, password)).rejects.toEqual({
        status: 401,
        message: 'Email ou mot de passe incorrect',
      });
    });
  });
});
