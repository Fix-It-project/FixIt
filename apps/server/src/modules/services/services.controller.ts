import type { Request, Response } from 'express';
import { servicesService } from './services.service.js';

export class ServicesController {
  async getByCategoryId(req: Request, res: Response): Promise<void> {
    const categoryId = req.params.categoryId as string;
    const services = await servicesService.getServicesByCategoryId(categoryId);
    res.json({ services });
  }

  async getById(req: Request, res: Response): Promise<void> {
    const serviceId = req.params.serviceId as string;
    const service = await servicesService.getServiceById(serviceId);
    res.json({ service });
  }
}

export const servicesController = new ServicesController();
