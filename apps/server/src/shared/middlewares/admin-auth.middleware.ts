import * as Sentry from "@sentry/node";
import type { NextFunction, Request, Response } from "express";
import { adminAuthService, adminCookieName } from "../../modules/admin-auth/admin-auth.service.js";
import { AppError } from "../errors/app-error.js";

/**
 * Validates the admin session cookie and attaches the admin to `req.admin`.
 * Admin routes that require a logged-in admin include this before their handler.
 */
export const requireAdminAuth = (
	req: Request,
	_res: Response,
	next: NextFunction,
) => {
	try {
		const token = req.cookies?.[adminCookieName];

		if (!token) {
			throw AppError.unauthorized("Not authenticated", { token: "no_token" });
		}

		const admin = adminAuthService.verify(token);

		Sentry.setUser({ id: admin.id, role: "admin" });
		if (req.log) {
			req.log = req.log.child({ adminId: admin.id, userRole: "admin" });
		}

		(req as any).admin = admin;
		return next();
	} catch (error) {
		if (error instanceof AppError) {
			return next(error);
		}
		return next(
			AppError.unauthorized("Invalid or expired session", { token: "invalid" }),
		);
	}
};
