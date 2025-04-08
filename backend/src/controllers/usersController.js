import * as userService from '../services/usersService.js';

export const getUsers = async (req, res) => {
  try {
    const users = await userService.getUsers();
    res.status(200).json(users);
  } catch (error) {
    console.error('Error getting users', error);
    res
      .status(500)
      .json({ message: 'Erreur lors de la récupération des utilisateurs' });
  }
};

export const getUserById = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const user = await userService.getUserById(id);
    res.status(200).json(user);
  } catch (error) {
    console.error('Error getting user', error);
    if (error.status === 404) {
      return res.status(404).json({ message: error.message });
    } else {
      res
        .status(500)
        .json({ message: "Erreur lors de la récupération de l'utilisateur" });
    }
  }
};

export const createUser = async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user', error);
    res
      .status(500)
      .json({
        message: "Erreur lors de la création de l'utilisateur " + error.message,
      });
  }
};

export const updateUser = async (req, res) => {
  const id = parseInt(req.params.id, 10);

  const data = req.body;
  try {
    const user = await userService.updateUser(id, data);
    res.status(200).json(user);
  } catch (error) {
    console.error('Error updating user', error);
    if (error.status === 404) {
      return res.status(404).json({ message: error.message });
    } else {
      res
        .status(500)
        .json({
          message:
            "Erreur lors de la mise à jour de l'utilisateur " + error.message,
        });
    }
  }
};

export const deleteUser = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const user = await userService.deleteUser(id);
    res.status(200).json(user);
  } catch (error) {
    console.error('Error deleting user', error);
    if (error.status === 404) {
      return res.status(404).json({ message: error.message });
    } else {
      res
        .status(500)
        .json({ message: "Erreur lors de la suppression de l'utilisateur" });
    }
  }
};
