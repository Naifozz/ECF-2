import * as userRepository from '../repositories/usersRepository.js';
import { validateUser } from '../models/usersModel.js';
export const getUsers = async () => {
  try {
    const users = await userRepository.getUsers();
    return users;
  } catch (error) {
    console.error('Error getting users', error);
    throw error;
  }
};

export const getUserById = async (id) => {
  try {
    const user = await userRepository.getUserById(id);
    if (!user) {
      throw { status: 404, message: `Utilisateur avec l'ID ${id} introuvable` };
    }
    return user;
  } catch (error) {
    console.error('Error getting user', error);
    throw error;
  }
};

export const createUser = async (data) => {
  try {
    const validation = validateUser(data);
    if (!validation.isValid) {
      throw { status: 400, message: validation.errors };
    }
    const user = await userRepository.createUser(data);

    return user;
  } catch (error) {
    console.error('Error creating user', error);
    throw error;
  }
};

export const updateUser = async (id, data) => {
  try {
    const existingUser = await userRepository.getUserById(id);
    if (!existingUser) {
      throw { status: 404, message: `Utilisateur avec l'ID ${id} introuvable` };
    }
    const validation = validateUser(data);
    if (!validation.isValid) {
      throw { status: 400, message: validation.errors };
    }
    const user = await userRepository.updateUser(id, data);
    return user;
  } catch (error) {
    console.error('Error updating user', error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    const existingUser = await userRepository.getUserById(id);
    if (!existingUser) {
      throw { status: 404, message: `Utilisateur avec l'ID ${id} introuvable` };
    }
    const user = await userRepository.deleteUser(id);
    return user;
  } catch (error) {
    console.error('Error deleting user', error);
    throw error;
  }
};
