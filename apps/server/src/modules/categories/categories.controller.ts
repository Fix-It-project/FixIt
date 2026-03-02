import type { Request, Response } from 'express';
import { categoriesService } from './categories.service.js';

export class CategoriesController {
  async getAll(_req: Request, res: Response): Promise<void> {
    const categories = await categoriesService.getAllCategories();
    res.json({ categories });
  }

  async getById(req: Request<{ id: string }>, res: Response): Promise<void> {
    const { id } = req.params;
    const category = await categoriesService.getCategoryById(id);
    res.json({ category });
  }
}

export const categoriesController = new CategoriesController();
