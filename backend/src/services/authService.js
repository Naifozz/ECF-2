import * as userRepository from '../repositories/usersRepository.js';
import { comparePassword } from '../models/usersModel.js';

export const login = async (email, password) => {
  try {
    // Vérifier si l'utilisateur existe
    const user = await userRepository.getUserByEmail(email);
    if (!user) {
      throw { status: 401, message: 'Email ou mot de passe incorrect' };
    }

    // Vérifier le mot de passe
    const isPasswordValid = await comparePassword(password, user.Password);
    if (!isPasswordValid) {
      throw { status: 401, message: 'Email ou mot de passe incorrect' };
    }

    // Ne pas renvoyer le mot de passe
    const { Password, ...userWithoutPassword } = user;

    return userWithoutPassword;
  } catch (error) {
    console.error('Error during login', error);
    throw error;
  }
};
