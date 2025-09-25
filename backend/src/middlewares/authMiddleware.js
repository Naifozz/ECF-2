import jwt from 'jsonwebtoken';
const SECRET_KEY = process.env.SECRET_KEY || 'exemple_clef_secrete';

export const isAuthenticated = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return false;

  const token = authHeader.split(' ')[1];
  if (!token) return false;
  try {
    const payload = jwt.verify(token, SECRET_KEY);
    req.user = payload;
    return true;
  } catch (err) {
    return false;
  }

  return res.status(401).json({ message: 'Authentification requise' });
};
