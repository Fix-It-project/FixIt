import type { Request, RequestHandler, Response } from 'express';
import { AppError } from '../../shared/errors/app-error.js';
import { asyncHandler } from '../../shared/errors/async-handler.js';
import { usersService } from './users.service.js';

export class UsersController {
	getProfile: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
		const userId = (req as any).user?.id;
		if (!userId) {
			throw AppError.unauthorized('User not authenticated', { token: 'no_user' });
		}

		const profile = await usersService.getProfile(userId);
		req.log.info({ action: 'user_profile_retrieved', userId });
		res.status(200).json({ profile });
	});

	updateProfile: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
		const userId = (req as any).user?.id;
		if (!userId) {
			throw AppError.unauthorized('User not authenticated', { token: 'no_user' });
		}

		const { full_name, email, phone } = req.body;

		const updated = await usersService.updateProfile(userId, {
			full_name,
			email,
			phone,
		});

		req.log.info({ action: 'user_profile_updated', userId });
		res.status(200).json({ profile: updated });
	});
}

export const usersController = new UsersController();
