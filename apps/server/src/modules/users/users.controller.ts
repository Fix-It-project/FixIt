import type { Request, Response } from 'express';
import { usersService } from './users.service.js';

export class UsersController {
  /** GET /api/users/profile — return profile + addresses */
  async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const profile = await usersService.getProfile(userId);
      return res.status(200).json({ profile });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return res.status(401).json({ error: message });
    }
  }

  /** PUT /api/users/profile — update full_name / email / phone */
  async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { full_name, email, phone } = req.body;

      if (!full_name && !email && !phone) {
        return res.status(400).json({ error: 'At least one field (full_name, email, phone) is required' });
      }

      const updated = await usersService.updateProfile(userId, {
        full_name,
        email,
        phone,
      });

      return res.status(200).json({ profile: updated });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return res.status(400).json({ error: message });
    }
  }
}

export const usersController = new UsersController();
