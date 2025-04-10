import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import process from 'process';
import session from 'express-session';
import userRouter from './src/routes/users.js';
import inventoryRouter from './src/routes/inventory.js';
import itemRouter from './src/routes/items.js';
import recipeRouter from './src/routes/recipe.js';
import authRouter from './src/routes/auth.js';
import { isAuthenticated } from './src/middlewares/authMiddleware.js';

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'super-mega-gros-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.use('/auth', authRouter);

app.use('/users', isAuthenticated, userRouter);
app.use('/items', isAuthenticated, itemRouter);
app.use('/inventory', isAuthenticated, inventoryRouter);
app.use('/recipes', isAuthenticated, recipeRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
