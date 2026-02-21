import { env } from "@FixIt/env/server";
import express, { type Request, type Response, type Express } from 'express';
import cors from 'cors';

const app: Express = express();

// Middlewares
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'FixIt API Server is running' });
});

export default app;
