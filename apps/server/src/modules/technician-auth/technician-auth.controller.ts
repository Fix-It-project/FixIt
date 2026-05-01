import { type Request, type Response } from 'express';
import { technicianAuthService } from './technician-auth.service.js';
import type { DocumentFiles } from '../../shared/storage/storage.repository.js';
import { normalizeError } from '../../shared/errors/index.js';

export class TechnicianAuthController {
  async checkEmail(req: Request, res: Response) {
    try {
      const { email } = req.body;
      const exists = await technicianAuthService.checkEmailExists(email);
      return res.status(200).json({ exists });
    } catch (err: unknown) {
      const { status, message } = normalizeError(err);
      return res.status(status).json({ error: message });
    }
  }

  async signUp(req: Request, res: Response) {
    try {
      const { email, password, first_name, last_name, phone, category_id, city, street, building_no, apartment_no, latitude, longitude } = req.body;

      const uploadedFiles = req.files as {
        [fieldname: string]: Express.Multer.File[];
      };

      const files: DocumentFiles = {
        criminal_record: uploadedFiles?.criminal_record?.[0],
        birth_certificate: uploadedFiles?.birth_certificate?.[0],
        national_id: uploadedFiles?.national_id?.[0],
      };

      const result = await technicianAuthService.signUp(
        { email, password, first_name, last_name, phone, category_id },
        files,
        { city, street, building_no, apartment_no, latitude, longitude },
      );

      return res.status(201).json(result);
    } catch (err: unknown) {
      const { status, message } = normalizeError(err);
      const resolvedStatus = message?.includes('already exists') ? 409 : (status === 500 ? 400 : status);
      return res.status(resolvedStatus).json({ error: message });
    }
  }

  async signIn(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await technicianAuthService.signIn(email, password);
      return res.status(200).json(result);
    } catch (err: unknown) {
      const { status, message } = normalizeError(err);
      return res.status(status === 500 ? 401 : status).json({ error: message });
    }
  }

  async signOut(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const result = await technicianAuthService.signOut(token);
      return res.status(200).json(result);
    } catch (err: unknown) {
      const { status, message } = normalizeError(err);
      return res.status(status === 500 ? 400 : status).json({ error: message });
    }
  }

  async getCurrentTechnician(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const technician = await technicianAuthService.getCurrentTechnician(token);
      return res.status(200).json({ technician });
    } catch (err: unknown) {
      const { status, message } = normalizeError(err);
      return res.status(status === 500 ? 401 : status).json({ error: message });
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      const result = await technicianAuthService.refreshSession(refreshToken);
      return res.status(200).json(result);
    } catch (err: unknown) {
      const { status, message } = normalizeError(err);
      return res.status(status === 500 ? 401 : status).json({ error: message });
    }
  }
}

export const technicianAuthController = new TechnicianAuthController();
