export const validateItem = (data) => {
  const errors = [];

  if (!data.Name) {
    errors.push('Le nom est requis');
  } else if (data.Name !== undefined) {
    if (typeof data.Name !== 'string') {
      errors.push('Le nom doit être une chaîne de caractères');
    } else if (data.Name.length < 2) {
      errors.push('Le nom doit contenir au moins 2 caractères');
    } else if (data.Name.length > 30) {
      errors.push('Le nom ne peut pas dépasser 100 caractères');
    }
  }

  if (!data.Image_Path) {
    errors.push("Le chemin de l'image est requis");
  } else if (data.Image_Path !== undefined) {
    if (typeof data.Image_Path !== 'string') {
      errors.push("Le chemin de l'image doit être une chaîne de caractères");
    } else if (!/\.(jpg|png|gif|webp)$/i.test(data.Image_Path)) {
      errors.push(
        "Le chemin de l'image doit avoir une extension valide (.jpg, .png, .gif, .webp)"
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
