process.env.NODE_ENV = 'test';
import { describe, it, expect } from 'vitest';
import { isValidEmail, validateUser } from '../../src/models/usersModel.js';

describe('isValidEmail', () => {
  it('✅ retourne true pour un email valide', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@domain.co')).toBe(true);
  });

  it('❌ retourne false pour un email invalide', () => {
    expect(isValidEmail('testexample.com')).toBe(false);
    expect(isValidEmail('test@.com')).toBe(false);
    expect(isValidEmail('test@domain')).toBe(false);
    expect(isValidEmail('test@')).toBe(false);
    expect(isValidEmail('@')).toBe(false);
  });
});

describe('validateUser', () => {
  it('✅ valide un utilisateur avec des données correctes', () => {
    const data = {
      Pseudo: 'User123',
      Email: 'user@example.com',
      Password: 'secretpass',
    };
    const result = validateUser(data);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('❌ retourne une erreur si le pseudo est manquant', () => {
    const data = {
      Email: 'user@example.com',
      Password: 'secretpass',
    };
    const result = validateUser(data);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Le pseudo est requis');
  });

  it("❌ retourne une erreur si le pseudo n'est pas une chaîne de caractères", () => {
    const data = {
      Pseudo: 123,
      Email: 'user@example.com',
      Password: 'secretpass',
    };
    const result = validateUser(data);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      'Le pseudo doit être une chaîne de caractères'
    );
  });

  it('❌ retourne une erreur si le pseudo est trop court', () => {
    const data = {
      Pseudo: 'ab',
      Email: 'user@example.com',
      Password: 'secretpass',
    };
    const result = validateUser(data);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      'Le pseudo doit contenir au moins 3 caractères'
    );
  });

  it('❌ retourne une erreur si le pseudo est trop long', () => {
    const data = {
      Pseudo: 'a'.repeat(31),
      Email: 'user@example.com',
      Password: 'secretpass',
    };
    const result = validateUser(data);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      'Le pseudo ne peut pas dépasser 30 caractères'
    );
  });

  it("❌ retourne une erreur si l'email est manquant", () => {
    const data = {
      Pseudo: 'User123',
      Password: 'secretpass',
    };
    const result = validateUser(data);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("L'email est requis");
  });

  it("❌ retourne une erreur si l'email n'est pas une chaîne de caractères", () => {
    const data = {
      Pseudo: 'User123',
      Email: 12345,
      Password: 'secretpass',
    };
    const result = validateUser(data);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "L'email doit être une chaîne de caractères"
    );
  });

  it("❌ retourne une erreur si l'email est invalide", () => {
    const data = {
      Pseudo: 'User123',
      Email: 'invalid-email',
      Password: 'secretpass',
    };
    const result = validateUser(data);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("L'email doit être valide");
  });

  it('❌ retourne une erreur si le mot de passe est manquant', () => {
    const data = {
      Pseudo: 'User123',
      Email: 'user@example.com',
    };
    const result = validateUser(data);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Le mot de passe est requis');
  });

  it("❌ retourne une erreur si le mot de passe n'est pas une chaîne de caractères", () => {
    const data = {
      Pseudo: 'User123',
      Email: 'user@example.com',
      Password: 123456,
    };
    const result = validateUser(data);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      'Le mot de passe doit être une chaîne de caractères'
    );
  });

  it('❌ retourne une erreur si le mot de passe est trop court', () => {
    const data = {
      Pseudo: 'User123',
      Email: 'user@example.com',
      Password: 'abc',
    };
    const result = validateUser(data);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      'Le mot de passe doit contenir au moins 6 caractères'
    );
  });

  it('❌ retourne plusieurs erreurs si plusieurs champs sont invalides', () => {
    const data = {
      Pseudo: 'ab',
      Email: 'invalid-email',
      Password: '123',
    };
    const result = validateUser(data);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      'Le pseudo doit contenir au moins 3 caractères'
    );
    expect(result.errors).toContain("L'email doit être valide");
    expect(result.errors).toContain(
      'Le mot de passe doit contenir au moins 6 caractères'
    );
  });
});
