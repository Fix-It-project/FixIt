import type { Request, Response } from 'express';
import type { ITechniciansService } from './technicians.service.js';

export class TechniciansController {
  constructor(private readonly service: ITechniciansService) {}

  async getByCategoryId(req: Request, res: Response): Promise<void> {
    const categoryId = req.params.categoryId as string;
    const { lat, lng } = this.parseCoords(req);
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
    const { lat, lng } = this.parseCoords(req);
    const technicians = await this.service.searchTechniciansByCategory(categoryId, query, lat, lng);
    res.json({ technicians });
  }

  private parseCoords(req: Request): { lat?: number; lng?: number } {
    const rawLat = req.query.lat as string | undefined;
    const rawLng = req.query.lng as string | undefined;
    if (rawLat == null || rawLng == null) return {};

    const lat = Number.parseFloat(rawLat);
    const lng = Number.parseFloat(rawLng);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return {};

    return { lat, lng };
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
}

