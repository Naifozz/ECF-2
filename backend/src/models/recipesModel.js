export const validateRecipe = (data) => {
  const errors = [];

  if (data.ID_Item_Result === undefined) {
    errors.push("L'ID de l'item résultant est requis");
  } else if (typeof data.ID_Item_Result !== 'number') {
    errors.push("L'ID de l'item résultant doit être un nombre");
  } else if (data.ID_Item_Result <= 0) {
    errors.push("L'ID de l'item résultant doit être un nombre positif");
  }

  if (!data.ingredients || !Array.isArray(data.ingredients)) {
    errors.push('Les ingrédients doivent être fournis sous forme de tableau');
  } else if (data.ingredients.length === 0) {
    errors.push('La recette doit contenir au moins un ingrédient');
  } else {
    // Vérifier les doublons de position
    const positions = data.ingredients.map((ing) => ing.Position);
    if (new Set(positions).size !== positions.length) {
      errors.push('Les positions des ingrédients doivent être uniques');
    }

    // Vérifier chaque ingrédient
    data.ingredients.forEach((ingredient, index) => {
      if (!ingredient.ID_Item) {
        errors.push(
          `L'ID de l'item est requis pour l'ingrédient à la position ${
            index + 1
          }`
        );
      } else if (typeof ingredient.ID_Item !== 'number') {
        errors.push(
          `L'ID de l'item doit être un nombre pour l'ingrédient à la position ${
            index + 1
          }`
        );
      }

      if (!ingredient.Position) {
        errors.push(
          `La position est requise pour l'ingrédient à la position ${index + 1}`
        );
      } else if (typeof ingredient.Position !== 'number') {
        errors.push(
          `La position doit être un nombre pour l'ingrédient à la position ${
            index + 1
          }`
        );
      } else if (ingredient.Position < 1 || ingredient.Position > 9) {
        errors.push(
          `La position doit être entre 1 et 9 pour l'ingrédient à la position ${
            index + 1
          }`
        );
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const getGridPosition = (position) => {
  if (position < 1 || position > 9) {
    throw new Error('Position invalide: doit être entre 1 et 9');
  }
  const adjustedPosition = position - 1;
  const x = adjustedPosition % 3;
  const y = Math.floor(adjustedPosition / 3);

  return { x, y };
};
