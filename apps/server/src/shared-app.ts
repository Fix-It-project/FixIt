import { env } from "@FixIt/env/server";
import * as Sentry from "@sentry/node";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Express } from "express";
import pinoHttp from "pino-http";
import { AppError } from "./shared/errors/app-error.js";
import { finalErrorMiddleware } from "./shared/errors/final-error-middleware.js";
import { logger } from "./shared/logger.js";

export function createSharedApp(): Express {
	const app = express();

	app.use(pinoHttp({ logger }));
	app.use(
		cors({
			origin: env.CORS_ORIGIN.split(","),
			methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
			allowedHeaders: ["Content-Type", "Authorization"],
			credentials: true,
		}),
	);
	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));
	app.use(cookieParser());

	return app;
}

export function mountTerminalHandlers(app: Express): void {
	app.use((_req, _res, next) => {
		next(AppError.notFound("Resource not found"));
	});

	Sentry.setupExpressErrorHandler(app);
	app.use(finalErrorMiddleware);
}
