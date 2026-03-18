import type { Request, Response } from 'express';
import type { ITechniciansService } from './technicians.service.js';
import { parseCoords } from '../../shared/utils/technicians/index.js';

export class TechniciansController {
  constructor(private readonly service: ITechniciansService) {}

  async getByCategoryId(req: Request, res: Response): Promise<void> {
    const categoryId = req.params.categoryId as string;
    const { lat, lng } = parseCoords(req);
    const technicians = await this.service.getTechniciansByCategory(categoryId, lat, lng);
    res.json({ technicians });
  }

  async searchInCategory(req: Request, res: Response): Promise<void> {
    const categoryId = req.params.categoryId as string;
    const query = (req.query.q as string | undefined)?.trim() ?? '';
    if (!query) {
      res.status(400).json({ error: 'Query parameter "q" is required' });
      return;
    }
    const { lat, lng } = parseCoords(req);
    const technicians = await this.service.searchTechniciansByCategory(categoryId, query, lat, lng);
    res.json({ technicians });
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const profile = await this.service.getTechnicianProfile(id);
      res.json({ profile });
    } catch (error: any) {
      const status = error.status ?? 500;
      res.status(status).json({ error: error.message ?? 'Internal server error' });
    }
  }

  async getSelf(req: Request, res: Response): Promise<void> {
    try {
      const technicianId = (req as any).technician.id as string;
      const profile = await this.service.getSelf(technicianId);
      res.json({ profile });
    } catch (error: any) {
      const status = error.status ?? 500;
      res.status(status).json({ error: error.message ?? 'Internal server error' });
    }
  }

  async updateSelf(req: Request, res: Response): Promise<void> {
    try {
      const technicianId = (req as any).technician.id as string;
      const { first_name, last_name, phone, description } = req.body;
      if (!first_name && !last_name && !phone && !description) {
        res.status(400).json({ error: 'At least one field (first_name, last_name, phone, description) is required' });
        return;
      }
      const profile = await this.service.updateSelf(technicianId, { first_name, last_name, phone, description });
      res.json({ profile });
    } catch (error: any) {
      const status = error.status ?? 500;
      res.status(status).json({ error: error.message ?? 'Internal server error' });
    }
  }

  async uploadProfileImage(req: Request, res: Response): Promise<void> {
    try {
      const technicianId = (req as any).technician.id as string;
      if (!req.file) {
        res.status(400).json({ error: 'No file provided. Send a multipart/form-data request with field "profile_image".' });
        return;
      }
      const result = await this.service.uploadProfileImage(technicianId, req.file);
      res.json(result);
    } catch (error: any) {
      const status = error.status ?? 500;
      res.status(status).json({ error: error.message ?? 'Internal server error' });
    }
  }
}
