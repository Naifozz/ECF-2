import jwt from 'jsonwebtoken';
const SECRET_KEY = process.env.SECRET_KEY || 'exemple_clef_secrete';

export const isAuthenticated = (req) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return false;

    const token = authHeader.substrin(7);

    if (!token) return false;

    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    return true;
  } catch (err) {
    console.error('Erreur de vérification du token:', error);
    return false;
  }

  return res.status(401).json({ message: 'Authentification requise' });
};
