import { type Request, type Response } from 'express';
import { technicianAuthService } from './technician-auth.service.js';
import type { TechnicianDocumentFiles } from './technician-auth.repository.js';

export class TechnicianAuthController {
  // POST /api/technician-auth/check-email
  async checkEmail(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const exists = await technicianAuthService.checkEmailExists(email);
      return res.status(200).json({ exists });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // POST /api/technician-auth/signup
  async signUp(req: Request, res: Response) {
    try {
      const { email, password, first_name, last_name, phone, category_id } = req.body;

      if (!email || !password || !first_name || !last_name || !category_id) {
        return res.status(400).json({
          error: 'email, password, first_name, last_name, and category_id are required',
        });
      }

      // multer populates req.files as a dictionary when fields() is used
      const uploadedFiles = req.files as {
        [fieldname: string]: Express.Multer.File[];
      };

      const files: TechnicianDocumentFiles = {
        criminal_record: uploadedFiles?.criminal_record?.[0],
        birth_certificate: uploadedFiles?.birth_certificate?.[0],
        national_id: uploadedFiles?.national_id?.[0],
      };

      const result = await technicianAuthService.signUp(
        { email, password, first_name, last_name, phone, category_id },
        files,
      );

      return res.status(201).json(result);
    } catch (error: any) {
      if (error.message?.includes('already exists')) {
        return res.status(409).json({ error: error.message });
      }
      return res.status(400).json({ error: error.message });
    }
  }

  // POST /api/technician-auth/signin
  async signIn(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const result = await technicianAuthService.signIn(email, password);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(401).json({ error: error.message });
    }
  }

  // POST /api/technician-auth/signout
  async signOut(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const result = await technicianAuthService.signOut(token);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  // GET /api/technician-auth/me
  async getCurrentTechnician(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const technician = await technicianAuthService.getCurrentTechnician(token);
      return res.status(200).json({ technician });
    } catch (error: any) {
      return res.status(401).json({ error: error.message });
    }
  }

  // POST /api/technician-auth/refresh
  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token is required' });
      }

      const result = await technicianAuthService.refreshSession(refreshToken);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(401).json({ error: error.message });
    }
  }

}

export const technicianAuthController = new TechnicianAuthController();
