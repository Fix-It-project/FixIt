import type { ITechnicianQueryRepository, ITechniciansRepository, TechnicianListDTO, TechnicianProfile, TechnicianSelfProfile, UpdateTechnicianSelfData } from './technicians.repository.js';
import { toDTO } from './technicians.repository.js';
import type { ICategoriesRepository } from '../categories/categories.repository.js';
import { sortByDistance } from '../../shared/utils/technicians/index.js';
import type { IStorageRepository } from '../../shared/storage/storage.repository.js';

export interface ITechniciansService {
  getTechniciansByCategory(categoryId: string, userLat?: number, userLng?: number): Promise<TechnicianListDTO[]>;
  searchTechniciansByCategory(categoryId: string, query: string, userLat?: number, userLng?: number): Promise<TechnicianListDTO[]>;
  getTechnicianProfile(id: string): Promise<TechnicianProfile>;
  getSelf(technicianId: string): Promise<TechnicianSelfProfile>;
  updateSelf(technicianId: string, data: UpdateTechnicianSelfData): Promise<TechnicianSelfProfile>;
  uploadProfileImage(technicianId: string, file: Express.Multer.File): Promise<{ profile_image: string }>;
}

export class TechniciansService implements ITechniciansService {
  constructor(
    private readonly repo: ITechnicianQueryRepository & Pick<ITechniciansRepository, 'getTechnicianSelf' | 'updateTechnicianSelf' | 'updateProfileImage'>,
    private readonly categoriesRepo: ICategoriesRepository,
    private readonly storageRepo: IStorageRepository,
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

  async getSelf(technicianId: string): Promise<TechnicianSelfProfile> {
    const profile = await this.repo.getTechnicianSelf(technicianId);
    if (!profile) {
      throw Object.assign(new Error('Technician not found'), { status: 404 });
    }
    return profile;
  }

  async updateSelf(technicianId: string, data: UpdateTechnicianSelfData): Promise<TechnicianSelfProfile> {
    await this.repo.updateTechnicianSelf(technicianId, data);
    return this.getSelf(technicianId);
  }

  async uploadProfileImage(technicianId: string, file: Express.Multer.File): Promise<{ profile_image: string }> {
    const url = await this.storageRepo.uploadFile(technicianId, 'profile_image', file);
    await this.repo.updateProfileImage(technicianId, url);
    return { profile_image: url };
  }
}
