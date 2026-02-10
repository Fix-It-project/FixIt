import express, { type Request, type Response, type Express } from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes.js';

const app: Express = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'FixIt API Server is running' });
});

// API Routes
app.use('/api/auth', authRoutes);

export default app;
