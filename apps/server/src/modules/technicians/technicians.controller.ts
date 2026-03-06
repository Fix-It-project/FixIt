import type { Request, Response } from 'express';
import type { ITechniciansService } from './technicians.service.js';

export class TechniciansController {
  constructor(private readonly service: ITechniciansService) {}

  async getByCategoryId(req: Request, res: Response): Promise<void> {
    const categoryId = req.params.categoryId as string;
    const technicians = await this.service.getTechniciansByCategory(categoryId);
    res.json({ technicians });
  }

  async searchInCategory(req: Request, res: Response): Promise<void> {
    const categoryId = req.params.categoryId as string;
    const query = (req.query.q as string | undefined)?.trim() ?? '';
    if (!query) {
      res.status(400).json({ error: 'Query parameter "q" is required' });
      return;
    }
    const technicians = await this.service.searchTechniciansByCategory(categoryId, query);
    res.json({ technicians });
  }
}
