import { type Request, type Response } from 'express';
import { authService } from './auth.service.js';

export class AuthController {
  async signUp(req: Request, res: Response) {
    try {
      const { email, password, fullName, phone, address } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const result = await authService.signUp({ email, password, fullName, phone, address });
      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async signIn(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const result = await authService.signIn({ email, password });
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(401).json({ error: error.message });
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
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
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
    } catch (error: any) {
      return res.status(401).json({ error: error.message });
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token is required' });
      }

      const result = await authService.refreshSession(refreshToken);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(401).json({ error: error.message });
    }
  }

  async requestPasswordReset(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      await authService.requestPasswordReset(email);
      return res.status(200).json({ 
        message: 'Password reset email sent. Please check your inbox.' 
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const { newPassword } = req.body;

      if (!newPassword) {
        return res.status(400).json({ error: 'New password is required' });
      }

      const result = await authService.updatePassword(newPassword);
      return res.status(200).json({ 
        message: 'Password updated successfully',
        user: result.user 
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}

export const authController = new AuthController();
