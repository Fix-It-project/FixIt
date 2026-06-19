import { env } from "@FixIt/env/server";
import bcrypt from "bcryptjs";
import type { CookieOptions } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../../shared/errors/app-error.js";
import type { AdminJwtPayload, AdminUser } from "./admin-auth.types.js";

export type { AdminUser } from "./admin-auth.types.js";

export const adminCookieName = "admin_session";

export const adminCookieOptions = (): CookieOptions => {
	const sameSite = env.ADMIN_COOKIE_SAME_SITE;

	return {
		httpOnly: true,
		// Browsers require SameSite=None cookies to also be Secure.
		secure: env.NODE_ENV === "production" || sameSite === "none",
		sameSite,
		path: "/",
		maxAge: env.ADMIN_SESSION_TTL_SECONDS * 1000,
	};
};

export class AdminAuthService {
	async login(
		email: string,
		password: string,
	): Promise<{ token: string; user: AdminUser }> {
		const emailOk =
			email.trim().toLowerCase() === env.ADMIN_EMAIL.trim().toLowerCase();
		// Always run bcrypt to keep timing uniform whether or not the email matched.
		const passwordOk = await bcrypt.compare(password, env.ADMIN_PASSWORD_HASH);

		if (!emailOk || !passwordOk) {
			throw AppError.unauthorized("Invalid email or password", {
				token: "invalid_credentials",
			});
		}

		const user: AdminUser = { id: "admin", email: env.ADMIN_EMAIL, role: "admin" };
		return { token: this.sign(user), user };
	}

	sign(user: AdminUser): string {
		const payload: AdminJwtPayload = {
			sub: "admin",
			email: user.email,
			role: "admin",
		};
		return jwt.sign(payload, env.ADMIN_JWT_SECRET, {
			expiresIn: env.ADMIN_SESSION_TTL_SECONDS,
		});
	}

	verify(token: string): AdminUser {
		const decoded = jwt.verify(token, env.ADMIN_JWT_SECRET) as AdminJwtPayload;
		return { id: "admin", email: decoded.email, role: "admin" };
	}
}

export const adminAuthService = new AdminAuthService();
