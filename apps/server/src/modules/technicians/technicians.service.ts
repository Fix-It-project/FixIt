import type { ITechnicianQueryRepository } from './technicians.repository.js';
import type { ICategoriesRepository } from '../categories/categories.repository.js';

/** Shape returned by the profile endpoint — all fields guaranteed non-null. */
export interface TechnicianProfile {
  name: string;
  profilePicture: string | null;
  description: string;
  completedOrders: string;
  totalBookings: string;
  reviews: string;
  phoneNumber: string;
}

export interface ITechniciansService {
  getTechniciansByCategory(categoryId: string): Promise<any[]>;
  searchTechniciansByCategory(categoryId: string, query: string): Promise<any[]>;
  getTechnicianProfile(id: string): Promise<TechnicianProfile>;
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

  async getTechnicianProfile(id: string): Promise<TechnicianProfile> {
    const technician = await this.repo.getTechnicianProfile(id);
    if (!technician) {
      throw Object.assign(new Error('Technician not found'), { status: 404 });
    }

    return {
      name: `${technician.first_name} ${technician.last_name}`,
      profilePicture: null,
      description: 'No description available',
      completedOrders: 'N/A',
      totalBookings: 'N/A',
      reviews: 'No reviews yet',
      phoneNumber: technician.phone ?? 'Not provided',
    };
  }
}

