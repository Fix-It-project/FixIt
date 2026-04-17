import type { Request, Response } from 'express';
import { usersService } from './users.service.js';
import { normalizeError } from '../../shared/errors/index.js';

export class UsersController {
  async getProfile(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const profile = await usersService.getProfile(userId);
      return res.status(200).json({ profile });
    } catch (err: unknown) {
      const { status, message } = normalizeError(err);
      return res.status(status === 500 ? 401 : status).json({ error: message });
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { full_name, email, phone } = req.body;

      const updated = await usersService.updateProfile(userId, {
        full_name,
        email,
        phone,
      });

      return res.status(200).json({ profile: updated });
    } catch (err: unknown) {
      const { status, message } = normalizeError(err);
      return res.status(status === 500 ? 400 : status).json({ error: message });
    }
  }
}

export const usersController = new UsersController();
