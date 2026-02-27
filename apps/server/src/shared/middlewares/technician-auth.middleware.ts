import type { Request, Response, NextFunction } from 'express';
import { technicianAuthService } from '../../modules/technician-auth/technician-auth.service.js';

export async function requireTechnicianAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const technician = await technicianAuthService.getCurrentTechnician(token);

    if (!technician) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Attach technician to request for use in controllers
    (req as any).technician = technician;

    return next();
  } catch (error: any) {
    return res.status(401).json({ error: error.message ?? 'Unauthorized' });
  }
}