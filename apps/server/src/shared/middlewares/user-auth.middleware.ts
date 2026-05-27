import type { Request, Response, NextFunction } from 'express';
import * as Sentry from '@sentry/node';
import { authService } from '../../modules/auth/auth.service.js';
import { AppError } from '../errors/app-error.js';

/**
 * Express middleware that validates the Bearer token and attaches the
 * authenticated user to `req.user`.  Routes that need a logged-in user
 * should include this middleware before their handler.
 */
export const requireUserAuth = (req: Request, _res: Response, next: NextFunction) => {
  (async () => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        throw AppError.unauthorized('No token provided', { token: 'no_token' });
      }

      const user = await authService.getCurrentUser(token);

      if (!user || !user.id) {
        throw AppError.unauthorized('Invalid or expired token', { token: 'expired' });
      }

      // Set Sentry user context
      Sentry.setUser({ id: user.id, role: 'user' });

      // Attach child logger with user context
      if (req.log) {
        req.log = req.log?.child({ userId: user.id, userRole: 'user' });
      }

      // Attach user to request for use in controllers
      (req as any).user = user;

      return next();
    } catch (error) {
      if (error instanceof AppError) {
        return next(error);
      }
      // Convert any token-related errors to unauthorized
      return next(AppError.unauthorized('Invalid or expired token', { token: 'invalid' }));
    }
  })();
};
