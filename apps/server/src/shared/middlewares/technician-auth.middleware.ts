import type { Request, Response, NextFunction } from 'express';
import * as Sentry from '@sentry/node';
import { technicianAuthService } from '../../modules/technician-auth/technician-auth.service.js';
import { AppError } from '../errors/app-error.js';

export const requireTechnicianAuth = (req: Request, _res: Response, next: NextFunction) => {
  (async () => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        throw AppError.unauthorized('No token provided', { token: 'no_token' });
      }

      const technician = await technicianAuthService.getCurrentTechnician(token);

      if (!technician) {
        throw AppError.unauthorized('Invalid or expired token', { token: 'expired' });
      }

      // Set Sentry user context
      Sentry.setUser({ id: technician.id, role: 'technician' });

      // Attach child logger with user context
      if (req.log) {
        req.log = req.log?.child({ userId: technician.id, userRole: 'technician' });
      }

      // Attach technician to request for use in controllers
      (req as any).technician = technician;

      return next();
    } catch (error) {
      return next(error);
    }
  })();
};