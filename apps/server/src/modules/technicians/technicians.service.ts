import type { ITechnicianQueryRepository, TechnicianListDTO, TechnicianProfile } from './technicians.repository.js';
import { toDTO } from './technicians.repository.js';
import type { ICategoriesRepository } from '../categories/categories.repository.js';
import { sortByDistance } from '../../shared/utils/technicians/index.js';

export interface ITechniciansService {
  getTechniciansByCategory(categoryId: string, userLat?: number, userLng?: number): Promise<TechnicianListDTO[]>;
  searchTechniciansByCategory(categoryId: string, query: string, userLat?: number, userLng?: number): Promise<TechnicianListDTO[]>;
  getTechnicianProfile(id: string): Promise<TechnicianProfile>;
}

export class TechniciansService implements ITechniciansService {
  constructor(
    private readonly repo: ITechnicianQueryRepository,
    private readonly categoriesRepo: ICategoriesRepository,
  ) {}

  async getTechniciansByCategory(categoryId: string, userLat?: number, userLng?: number): Promise<TechnicianListDTO[]> {
    const category = await this.categoriesRepo.getCategoryById(categoryId);
    if (!category) throw Object.assign(new Error('Category not found'), { status: 404 });

    const rows = await this.repo.getTechniciansByCategory(categoryId);
    const dtos = rows.map((r) => toDTO(r, userLat, userLng));

    return userLat != null && userLng != null ? sortByDistance(dtos) : dtos;
  }

  async searchTechniciansByCategory(categoryId: string, query: string, userLat?: number, userLng?: number): Promise<TechnicianListDTO[]> {
    const category = await this.categoriesRepo.getCategoryById(categoryId);
    if (!category) throw Object.assign(new Error('Category not found'), { status: 404 });

    const rows = await this.repo.searchTechniciansByCategory(categoryId, query);
    const dtos = rows.map((r) => toDTO(r, userLat, userLng));

    return userLat != null && userLng != null ? sortByDistance(dtos) : dtos;
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
