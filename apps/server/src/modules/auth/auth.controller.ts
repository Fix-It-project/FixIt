import { type Request, type RequestHandler, type Response } from 'express';
import { authService } from './auth.service.js';
import { asyncHandler } from '../../shared/errors/async-handler.js';
import { AppError } from '../../shared/errors/app-error.js';

export class AuthController {
  signUp: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, fullName, phone, address, city, street, building_no, apartment_no, latitude, longitude } = req.body;
    const result = await authService.signUp(
      { email, password, fullName, phone, address },
      { city, street, building_no, apartment_no, latitude, longitude },
    );
    req.log.info({ action: 'user_signup', userId: result.user?.id });
    res.status(201).json(result);
  });

  signIn: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await authService.signIn({ email, password });
    req.log.info({ action: 'user_signin', userId: result.user?.id });
    res.status(200).json(result);
  });

  signOut: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      throw AppError.unauthorized('No token provided', { token: 'no_token' });
    }

    const result = await authService.signOut(token);
    req.log.info({ action: 'user_signout' });
    res.status(200).json(result);
  });

  getCurrentUser: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    // User is already attached by requireUserAuth middleware
    const user = (req as any).user;
    res.status(200).json({ user });
  });

  oauthStatus: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const result = await authService.oauthStatus(user);
    res.status(200).json(result);
  });

  oauthComplete: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const { fullName, phone, city, street, building_no, apartment_no, latitude, longitude } = req.body;
    const result = await authService.completeOAuthProfile(
      user,
      { city, street, building_no, apartment_no, latitude, longitude },
      { fullName, phone },
    );
    req.log.info({ action: 'oauth_complete', userId: user?.id });
    res.status(201).json(result);
  });

  refreshToken: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const result = await authService.refreshSession(refreshToken);
    req.log.info({ action: 'token_refresh', userId: result.user?.id });
    res.status(200).json(result);
  });

  requestPasswordReset: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    await authService.requestPasswordReset(email);
    req.log.info({ action: 'password_reset_requested', email });
    res.status(200).json({
      message: 'Password reset email sent. Please check your inbox.',
    });
  });

  resetPassword: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { newPassword } = req.body;
    const result = await authService.updatePassword(newPassword);
    req.log.info({ action: 'password_reset', userId: result.user?.id });
    res.status(200).json({
      message: 'Password updated successfully',
      user: result.user,
    });
  });
}

export const authController = new AuthController();
