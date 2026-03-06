import type { ITechnicianQueryRepository } from './technicians.repository.js';
import type { ICategoriesRepository } from '../categories/categories.repository.js';

export interface ITechniciansService {
  getTechniciansByCategory(categoryId: string): Promise<any[]>;
  searchTechniciansByCategory(categoryId: string, query: string): Promise<any[]>;
}

export class TechniciansService implements ITechniciansService {
  constructor(
    private readonly repo: ITechnicianQueryRepository,
    private readonly categoriesRepo: ICategoriesRepository,
  ) {}

  async getTechniciansByCategory(categoryId: string): Promise<any[]> {
    const category = await this.categoriesRepo.getCategoryById(categoryId);
    if (!category) throw Object.assign(new Error('Category not found'), { status: 404 });
    return this.repo.getTechniciansByCategory(categoryId);
  }

  async searchTechniciansByCategory(categoryId: string, query: string): Promise<any[]> {
    const category = await this.categoriesRepo.getCategoryById(categoryId);
    if (!category) throw Object.assign(new Error('Category not found'), { status: 404 });
    return this.repo.searchTechniciansByCategory(categoryId, query);
  }
}
