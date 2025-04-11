import bcrypt from 'bcrypt';

export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateUser = (data) => {
  const errors = [];

  // Validation du pseudo
  if (!data.Pseudo) {
    errors.push('Le pseudo est requis');
  } else if (data.Pseudo !== undefined) {
    if (typeof data.Pseudo !== 'string') {
      errors.push('Le pseudo doit être une chaîne de caractères');
    } else if (data.Pseudo.length < 3) {
      errors.push('Le pseudo doit contenir au moins 3 caractères');
    } else if (data.Pseudo.length > 30) {
      errors.push('Le pseudo ne peut pas dépasser 30 caractères');
    }
  }

  // Validation de l'email
  if (!data.Email) {
    errors.push("L'email est requis");
  } else if (data.Email !== undefined) {
    if (typeof data.Email !== 'string') {
      errors.push("L'email doit être une chaîne de caractères");
    } else if (!isValidEmail(data.Email)) {
      errors.push("L'email doit être valide");
    }
  }

  // Validation du mot de passe
  if (!data.Password) {
    errors.push('Le mot de passe est requis');
  } else if (data.Password !== undefined) {
    if (typeof data.Password !== 'string') {
      errors.push('Le mot de passe doit être une chaîne de caractères');
    } else if (data.Password.length < 6) {
      errors.push('Le mot de passe doit contenir au moins 6 caractères');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};
