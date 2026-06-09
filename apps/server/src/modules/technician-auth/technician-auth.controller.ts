import { type Request, type RequestHandler, type Response } from 'express';
import { technicianAuthService } from './technician-auth.service.js';
import type { DocumentFiles } from '../../shared/storage/storage.repository.js';
import { asyncHandler } from '../../shared/errors/async-handler.js';
import { AppError } from '../../shared/errors/app-error.js';

export class TechnicianAuthController {
  checkEmail: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    const exists = await technicianAuthService.checkEmailExists(email);
    res.status(200).json({ exists });
  });

  signUp: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, first_name, last_name, phone, category_id, city, street, building_no, apartment_no, latitude, longitude, expo_push_token } = req.body;

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
      expo_push_token,
    );

    req.log.info({ action: 'technician_signup', technicianId: result.technician?.id });
    res.status(201).json(result);
  });

  signIn: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await technicianAuthService.signIn(email, password);
    req.log.info({ action: 'technician_signin', technicianId: result.technician?.id });
    res.status(200).json(result);
  });

  cancelApplication: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await technicianAuthService.cancelApplication(email, password);
    req.log.info({ action: 'technician_cancel_application' });
    res.status(200).json(result);
  });

  signOut: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw AppError.unauthorized('No token provided', { token: 'no_token' });
    }

    const result = await technicianAuthService.signOut(token);
    req.log.info({ action: 'technician_signout' });
    res.status(200).json(result);
  });

  getCurrentTechnician: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw AppError.unauthorized('No token provided', { token: 'no_token' });
    }

    const technician = await technicianAuthService.getCurrentTechnician(token);
    res.status(200).json({ technician });
  });

  refreshToken: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const result = await technicianAuthService.refreshSession(refreshToken);
    req.log.info({ action: 'technician_token_refresh', technicianId: result.technician?.id });
    res.status(200).json(result);
  });
}

export const technicianAuthController = new TechnicianAuthController();
