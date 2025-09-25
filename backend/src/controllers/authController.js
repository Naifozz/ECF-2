import * as authService from '../services/authService.js';
import * as userService from '../services/usersService.js';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.SECRET_KEY || 'exemple_clef_secrete';

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email et mot de passe requis' });
  }

  try {
    const user = await authService.login(email, password);

    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      SECRET_KEY,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Connexion réussie',
      user,
      token,
    });
  } catch (error) {
    console.error('Error logging in', error);
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Erreur lors de la connexion' });
    }
  }
};

export const register = async (req, res) => {
  try {
    const user = await userService.createUser(req.body);

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      SECRET_KEY,
      { expiresIn: '24h' }
    );
    res.status(201).json({
      message: 'Inscription réussie',
      user,
      token,
    });
  } catch (error) {
    console.error('Error registering user', error);
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Erreur lors de l'inscription" });
    }
  }
};

export const logout = (req, res) => {
  res.status(200).json({
    message: 'Déconnexion réussie',
    note: 'Veuillez supprimer le token côté client',
  });
};

export const getCurrentUser = (req, res) => {
  if (req.user) {
    res.status(200).json({ user: req.user });
  } else {
    res.status(401).json({ message: 'Non connecté' });
  }
};
