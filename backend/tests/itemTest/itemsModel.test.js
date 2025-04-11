process.env.NODE_ENV = 'test';
import { describe, it, expect } from 'vitest';
import {
  validateItem,
  validateItemQuantity,
} from '../../src/models/itemsModel.js';

describe('validateItem', () => {
  it('✅ valide un item avec des données correctes', () => {
    const data = {
      Name: 'Épée en fer',
      Image_Path: '/images/iron_sword.png',
    };
    const result = validateItem(data);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('❌ retourne une erreur si le nom est manquant', () => {
    const data = {
      Image_Path: '/images/iron_sword.png',
    };
    const result = validateItem(data);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Le nom est requis');
  });

  it("❌ retourne une erreur si le nom n'est pas une chaîne de caractères", () => {
    const data = {
      Name: 123,
      Image_Path: '/images/iron_sword.png',
    };
    const result = validateItem(data);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      'Le nom doit être une chaîne de caractères'
    );
  });

  it('❌ retourne une erreur si le nom est trop court', () => {
    const data = {
      Name: 'A',
      Image_Path: '/images/iron_sword.png',
    };
    const result = validateItem(data);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      'Le nom doit contenir au moins 2 caractères'
    );
  });

  it('❌ retourne une erreur si le nom est trop long', () => {
    const data = {
      Name: 'a'.repeat(101),
      Image_Path: '/images/iron_sword.png',
    };
    const result = validateItem(data);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      'Le nom ne peut pas dépasser 100 caractères'
    );
  });

  it("❌ retourne une erreur si le chemin de l'image est manquant", () => {
    const data = {
      Name: 'Épée en fer',
    };
    const result = validateItem(data);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Le chemin de l'image est requis");
  });

  it("❌ retourne une erreur si le chemin de l'image n'est pas une chaîne de caractères", () => {
    const data = {
      Name: 'Épée en fer',
      Image_Path: 12345,
    };
    const result = validateItem(data);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "Le chemin de l'image doit être une chaîne de caractères"
    );
  });

  it("❌ retourne une erreur si le chemin de l'image n'a pas une extension valide", () => {
    const data = {
      Name: 'Épée en fer',
      Image_Path: '/images/iron_sword.txt',
    };
    const result = validateItem(data);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "Le chemin de l'image doit avoir une extension valide (.jpg, .png, .gif, .webp)"
    );
  });

  it('❌ retourne plusieurs erreurs si plusieurs champs sont invalides', () => {
    const data = {
      Name: 'A',
      Image_Path: 12345,
    };
    const result = validateItem(data);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      'Le nom doit contenir au moins 2 caractères'
    );
    expect(result.errors).toContain(
      "Le chemin de l'image doit être une chaîne de caractères"
    );
  });
});
