process.env.NODE_ENV = 'test';
import { describe, it, expect } from 'vitest';
import {
  validateRecipe,
  getGridPosition,
} from '../../src/models/recipesModel.js';

describe('validateRecipe', () => {
  it('✅ valide une recette avec des données correctes', () => {
    const data = {
      ID_Item_Result: 1,
      ingredients: [
        { ID_Item: 2, Position: 1 },
        { ID_Item: 3, Position: 2 },
        { ID_Item: 4, Position: 5 },
      ],
    };
    const result = validateRecipe(data);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("❌ retourne une erreur si l'ID de l'item résultant est manquant", () => {
    const data = {
      ingredients: [
        { ID_Item: 2, Position: 1 },
        { ID_Item: 3, Position: 2 },
      ],
    };
    const result = validateRecipe(data);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("L'ID de l'item résultant est requis");
  });

  it("❌ retourne une erreur si l'ID de l'item résultant n'est pas un nombre", () => {
    const data = {
      ID_Item_Result: '1',
      ingredients: [
        { ID_Item: 2, Position: 1 },
        { ID_Item: 3, Position: 2 },
      ],
    };
    const result = validateRecipe(data);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "L'ID de l'item résultant doit être un nombre"
    );
  });

  it("❌ retourne une erreur si l'ID de l'item résultant est négatif ou zéro", () => {
    const data = {
      ID_Item_Result: 0,
      ingredients: [
        { ID_Item: 2, Position: 1 },
        { ID_Item: 3, Position: 2 },
      ],
    };
    const result = validateRecipe(data);
    expect(result.isValid).toBe(false);

    console.log('Erreurs réelles:', result.errors);
    expect(result.errors.some((error) => error.includes('positif'))).toBe(true);
  });

  it('❌ retourne une erreur si les ingrédients ne sont pas fournis', () => {
    const data = {
      ID_Item_Result: 1,
    };
    const result = validateRecipe(data);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      'Les ingrédients doivent être fournis sous forme de tableau'
    );
  });

  it('❌ retourne une erreur si la liste des ingrédients est vide', () => {
    const data = {
      ID_Item_Result: 1,
      ingredients: [],
    };
    const result = validateRecipe(data);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      'La recette doit contenir au moins un ingrédient'
    );
  });

  it("❌ retourne une erreur si un ingrédient n'a pas d'ID d'item", () => {
    const data = {
      ID_Item_Result: 1,
      ingredients: [{ ID_Item: 2, Position: 1 }, { Position: 2 }],
    };
    const result = validateRecipe(data);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "L'ID de l'item est requis pour l'ingrédient à la position 2"
    );
  });

  it("❌ retourne une erreur si un ingrédient n'a pas de position", () => {
    const data = {
      ID_Item_Result: 1,
      ingredients: [{ ID_Item: 2, Position: 1 }, { ID_Item: 3 }],
    };
    const result = validateRecipe(data);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "La position est requise pour l'ingrédient à la position 2"
    );
  });

  it("❌ retourne une erreur si la position d'un ingrédient est hors limites", () => {
    const data = {
      ID_Item_Result: 1,
      ingredients: [
        { ID_Item: 2, Position: 1 },
        { ID_Item: 3, Position: 10 },
      ],
    };
    const result = validateRecipe(data);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "La position doit être entre 1 et 9 pour l'ingrédient à la position 2"
    );
  });

  it('❌ retourne une erreur si des ingrédients ont la même position', () => {
    const data = {
      ID_Item_Result: 1,
      ingredients: [
        { ID_Item: 2, Position: 1 },
        { ID_Item: 3, Position: 1 },
      ],
    };
    const result = validateRecipe(data);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      'Les positions des ingrédients doivent être uniques'
    );
  });

  it('❌ retourne plusieurs erreurs si plusieurs champs sont invalides', () => {
    const data = {
      ID_Item_Result: -1,
      ingredients: [{ ID_Item: 'abc', Position: 0 }],
    };
    const result = validateRecipe(data);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
  });
});

describe('getGridPosition', () => {
  it('✅ convertit correctement une position linéaire en coordonnées x,y', () => {
    expect(getGridPosition(1)).toEqual({ x: 0, y: 0 });
    expect(getGridPosition(5)).toEqual({ x: 1, y: 1 });
    expect(getGridPosition(9)).toEqual({ x: 2, y: 2 });
  });

  it('❌ lance une erreur pour une position invalide', () => {
    expect(() => getGridPosition(0)).toThrow('Position invalide');
    expect(() => getGridPosition(10)).toThrow('Position invalide');
  });
});
