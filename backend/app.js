import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import process from 'process';
import userRouter from './src/routes/users.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/users', userRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});