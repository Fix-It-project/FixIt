import { type Request, type Response } from 'express';
import { authService } from './auth.service.js';
import { normalizeError } from '../../shared/errors/index.js';

export class AuthController {
  async signUp(req: Request, res: Response) {
    try {
      const { email, password, fullName, phone, address, city, street, building_no, apartment_no, latitude, longitude } = req.body;

      const result = await authService.signUp(
        { email, password, fullName, phone, address },
        { city, street, building_no, apartment_no, latitude, longitude },
      );
      return res.status(201).json(result);
    } catch (err: unknown) {
      const { status, message } = normalizeError(err);
      return res.status(status === 500 ? 400 : status).json({ error: message });
    }
  }

  async signIn(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await authService.signIn({ email, password });
      return res.status(200).json(result);
    } catch (err: unknown) {
      const { status, message } = normalizeError(err);
      return res.status(status === 500 ? 401 : status).json({ error: message });
    }
  }

  async signOut(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const result = await authService.signOut(token);
      return res.status(200).json(result);
    } catch (err: unknown) {
      const { status, message } = normalizeError(err);
      return res.status(status === 500 ? 400 : status).json({ error: message });
    }
  }

  async getCurrentUser(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const user = await authService.getCurrentUser(token);
      return res.status(200).json({ user });
    } catch (err: unknown) {
      const { status, message } = normalizeError(err);
      return res.status(status === 500 ? 401 : status).json({ error: message });
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshSession(refreshToken);
      return res.status(200).json(result);
    } catch (err: unknown) {
      const { status, message } = normalizeError(err);
      return res.status(status === 500 ? 401 : status).json({ error: message });
    }
  }

  async requestPasswordReset(req: Request, res: Response) {
    try {
      const { email } = req.body;
      await authService.requestPasswordReset(email);
      return res.status(200).json({
        message: 'Password reset email sent. Please check your inbox.',
      });
    } catch (err: unknown) {
      const { status, message } = normalizeError(err);
      return res.status(status === 500 ? 400 : status).json({ error: message });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const { newPassword } = req.body;
      const result = await authService.updatePassword(newPassword);
      return res.status(200).json({
        message: 'Password updated successfully',
        user: result.user,
      });
    } catch (err: unknown) {
      const { status, message } = normalizeError(err);
      return res.status(status === 500 ? 400 : status).json({ error: message });
    }
  }
}

export const authController = new AuthController();
