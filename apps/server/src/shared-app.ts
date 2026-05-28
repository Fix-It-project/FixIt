import { env } from "@FixIt/env/server";
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Express, type Request, type Response } from 'express';
import pinoHttp from 'pino-http';
import * as Sentry from '@sentry/node';
import { logger } from './shared/logger.js';

const app: Express = express();

app.use(pinoHttp({ logger }));

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
app.use(cookieParser());

app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'FixIt API Server is running' });
});

// Mount Sentry error handler
Sentry.setupExpressErrorHandler(app);

// Routes and error handlers will be added by app.ts

export default app;
