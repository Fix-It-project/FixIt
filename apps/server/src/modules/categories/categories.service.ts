import { categoriesRepository, type ICategoriesRepository } from './categories.repository.js';

export class CategoriesService {
  constructor(private readonly repo: ICategoriesRepository) {}

  async getAllCategories() {
    return this.repo.getAllCategories();
  }

  async getCategoryById(id: string) {
    const category = await this.repo.getCategoryById(id);
    if (!category) throw Object.assign(new Error('Category not found'), { status: 404 });
    return category;
  }
}

export const categoriesService = new CategoriesService(categoriesRepository);
