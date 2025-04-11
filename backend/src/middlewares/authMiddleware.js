export const isAuthenticated = (req, res, next) => {
  if (req.session.isLoggedIn && req.session.user) {
    return next();
  }
  return res.status(401).json({ message: 'Authentification requise' });
};
