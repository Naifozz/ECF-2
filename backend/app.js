import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import process from 'process';
import session from 'express-session';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import userRouter from './src/routes/users.js';
import inventoryRouter from './src/routes/inventory.js';
import itemRouter from './src/routes/items.js';
import recipeRouter from './src/routes/recipe.js';
import authRouter from './src/routes/auth.js';
import cookieParser from 'cookie-parser';
import { isAuthenticated } from './src/middlewares/authMiddleware.js';
import { csrfProtection } from './src/middlewares/csrfMiddleware.js';

dotenv.config();

const app = express();

// Protection contre les attaques XSS via headers HTTP
app.use(helmet());

// Protection contre les attaques par force brute
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes par IP
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    allowedHeaders: ['Content-Type', 'X-CSRF-Token'], // Ajouter X-CSRF-Token aux headers autorisés
  })
);
app.use(express.json({ limit: '10kb' })); // Limite la taille du corps des requêtes

app.use(cookieParser());

// Configuration de session sécurisée
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'super-mega-gros-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true, // Empêche l'accès via JavaScript
      sameSite: 'lax', // 'strict' peut causer des problèmes avec certains navigateurs, 'lax' est un bon compromis
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

// Routes publiques (non protégées par CSRF)
app.use('/auth', authRouter);

// Route pour obtenir un token CSRF
app.get('/csrf-token', isAuthenticated, csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Routes protégées avec authentification et CSRF
app.use('/users', isAuthenticated, csrfProtection, userRouter);
app.use('/items', isAuthenticated, csrfProtection, itemRouter);
app.use('/inventory', isAuthenticated, csrfProtection, inventoryRouter);
app.use('/recipes', isAuthenticated, csrfProtection, recipeRouter);

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({ message: 'Validation CSRF échouée' });
  }
  console.error(err.stack);
  res.status(500).json({ message: 'Erreur interne du serveur' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
