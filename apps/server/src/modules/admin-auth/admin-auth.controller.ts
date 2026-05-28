import { type Request, type RequestHandler, type Response } from "express";
import { asyncHandler } from "../../shared/errors/async-handler.js";
import {
	adminAuthService,
	adminCookieName,
	adminCookieOptions,
} from "./admin-auth.service.js";

export class AdminAuthController {
	login: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
		const { email, password } = req.body;
		const { token, user } = await adminAuthService.login(email, password);
		res.cookie(adminCookieName, token, adminCookieOptions());
		req.log.info({ action: "admin_login", email: user.email });
		res.status(200).json({ user });
	});

	logout: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
		const { maxAge: _maxAge, ...clearOpts } = adminCookieOptions();
		res.clearCookie(adminCookieName, clearOpts);
		req.log.info({ action: "admin_logout" });
		res.status(200).json({ message: "Signed out" });
	});

	getCurrentAdmin: RequestHandler = asyncHandler(
		async (req: Request, res: Response) => {
			const user = (req as any).admin;
			res.status(200).json({ user });
		},
	);
}

export const adminAuthController = new AdminAuthController();
