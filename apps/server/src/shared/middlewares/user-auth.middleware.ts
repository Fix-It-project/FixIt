import type { Request, Response, NextFunction } from 'express';
import { authService } from '../../modules/auth/auth.service.js';

/**
 * Express middleware that validates the Bearer token and attaches the
 * authenticated user to `req.user`.  Routes that need a logged-in user
 * should include this middleware before their handler.
 */
export async function requireUserAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const user = await authService.getCurrentUser(token);

    if (!user || !user.id) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Attach user to request for use in controllers
    (req as any).user = user;

    return next();
  } catch (error: any) {
    return res.status(401).json({ error: error.message ?? 'Unauthorized' });
  }
}
