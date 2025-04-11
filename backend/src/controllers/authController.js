import * as authService from '../services/authService.js';
import * as userService from '../services/usersService.js';

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email et mot de passe requis' });
  }

  try {
    const user = await authService.login(email, password);

    req.session.user = user;
    req.session.isLoggedIn = true;

    res.status(200).json({
      message: 'Connexion réussie',
      user,
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

    req.session.user = user;
    req.session.isLoggedIn = true;

    res.status(201).json({
      message: 'Inscription réussie',
      user,
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
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la déconnexion' });
    }
    res.status(200).json({ message: 'Déconnexion réussie' });
  });
};

export const getCurrentUser = (req, res) => {
  if (req.session.user && req.session.isLoggedIn) {
    res.status(200).json({ user: req.session.user });
  } else {
    res.status(401).json({ message: 'Non connecté' });
  }
};
