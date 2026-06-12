import type { Request, Response, NextFunction } from 'express';
import * as Sentry from '@sentry/node';
import { technicianAuthService } from '../../modules/technician-auth/technician-auth.service.js';
import { techniciansRepository } from '../../modules/technicians/technicians.repository.js';
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

      // Mid-session block enforcement (fail-open). block_pending technicians pass
      // (status stays 'verified' until they finish their in-flight jobs); only a
      // fully blocked technician (status='blocked') is stopped here.
      let blocked = false;
      let blockReason: string | null = null;
      try {
        const record = await techniciansRepository.getTechnicianById(technician.id);
        blocked = (record as { status?: string } | null)?.status === 'blocked';
        blockReason = (record as { blocked_reason?: string | null } | null)?.blocked_reason ?? null;
      } catch (err) {
        req.log?.warn({ err, technicianId: technician.id }, '[auth] technician blocked re-check failed (allowing)');
      }
      if (blocked) {
        throw AppError.forbidden('Your account has been blocked. Contact support for assistance.', {
          fields: { accountStatus: 'blocked', ...(blockReason ? { blockReason } : {}) },
        });
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