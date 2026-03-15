import { env } from "@FixIt/env/server";
import express, { type Request, type Response, type Express } from 'express';
import cors from 'cors';

const app: Express = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN.split(','),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'FixIt API Server is running' });
});

export default app;
