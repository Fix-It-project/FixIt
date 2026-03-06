import { servicesRepository, type IServicesRepository } from './services.repository.js';
import { categoriesRepository, type ICategoriesRepository } from '../categories/categories.repository.js';

export class ServicesService {
  constructor(
    private readonly repo: IServicesRepository,
    private readonly categoriesRepo: ICategoriesRepository,
  ) {}

  async getServicesByCategoryId(categoryId: string) {
    const category = await this.categoriesRepo.getCategoryById(categoryId);
    if (!category) throw Object.assign(new Error('Category not found'), { status: 404 });

    return this.repo.getServicesByCategoryId(categoryId);
  }

  async getServiceById(id: string) {
    const service = await this.repo.getServiceById(id);
    if (!service) throw Object.assign(new Error('Service not found'), { status: 404 });
    return service;
  }
}

export const servicesService = new ServicesService(servicesRepository, categoriesRepository);
