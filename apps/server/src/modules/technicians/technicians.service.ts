import type { ITechnicianQueryRepository, ITechniciansRepository, TechnicianListDTO, TechnicianProfile, TechnicianSelfProfile, UpdateTechnicianSelfData } from './technicians.repository.js';
import { toDTO } from './technicians.repository.js';
import type { ICategoriesRepository } from '../categories/categories.repository.js';
import { sortByDistance } from '../../shared/utils/technicians/index.js';
import type { IStorageRepository } from '../../shared/storage/storage.repository.js';
import { supabaseAdmin } from '../../shared/db/supabase.js';
import type { TechnicianSort } from '../../shared/dtos/index.js';

export interface TechnicianListOpts {
  lat?: number;
  lng?: number;
  sort?: TechnicianSort;
}

export interface ITechniciansService {
  getTechniciansByCategory(categoryId: string, opts?: TechnicianListOpts): Promise<TechnicianListDTO[]>;
  searchTechniciansByCategory(categoryId: string, query: string, opts?: TechnicianListOpts): Promise<TechnicianListDTO[]>;
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

  async getTechniciansByCategory(categoryId: string, opts?: TechnicianListOpts): Promise<TechnicianListDTO[]> {
    const { lat, lng, sort } = opts ?? {};
    const category = await this.categoriesRepo.getCategoryById(categoryId);
    if (!category) throw Object.assign(new Error('Category not found'), { status: 404 });

    const rows = await this.repo.getTechniciansByCategory(categoryId);
    const dtos = rows.map((r) => toDTO(r, lat, lng));

    return this.applySort(dtos, sort, lat, lng);
  }

  async searchTechniciansByCategory(categoryId: string, query: string, opts?: TechnicianListOpts): Promise<TechnicianListDTO[]> {
    const { lat, lng, sort } = opts ?? {};
    const category = await this.categoriesRepo.getCategoryById(categoryId);
    if (!category) throw Object.assign(new Error('Category not found'), { status: 404 });

    const rows = await this.repo.searchTechniciansByCategory(categoryId, query);
    const dtos = rows.map((r) => toDTO(r, lat, lng));

    return this.applySort(dtos, sort, lat, lng);
  }

  private async applySort(
    dtos: TechnicianListDTO[],
    sort: TechnicianSort | undefined,
    lat: number | undefined,
    lng: number | undefined,
  ): Promise<TechnicianListDTO[]> {
    if (sort === 'top_rated') {
      return [...dtos].sort((a, b) => {
        const ratingA = a.avg_rating ?? -1;
        const ratingB = b.avg_rating ?? -1;
        if (ratingB !== ratingA) return ratingB - ratingA;
        if (b.review_count !== a.review_count) return b.review_count - a.review_count;
        return a.first_name.localeCompare(b.first_name);
      });
    }

    if (sort === 'most_reviews') {
      return [...dtos].sort((a, b) => {
        if (b.review_count !== a.review_count) {
          return b.review_count - a.review_count;
        }
        const ratingA = a.avg_rating ?? -1;
        const ratingB = b.avg_rating ?? -1;
        if (ratingB !== ratingA) return ratingB - ratingA;
        return a.first_name.localeCompare(b.first_name);
      });
    }

    // Default: alphabetical (already ordered by DB), then distance if coords provided.
    return lat != null && lng != null ? sortByDistance(dtos) : dtos;
  }

  async getTechnicianProfile(id: string): Promise<TechnicianProfile> {
    const technician = await this.repo.getTechnicianProfile(id);
    if (!technician) {
      throw Object.assign(new Error('Technician not found'), { status: 404 });
    }

    const [{ count: totalBookings }, { count: completedOrders }] = await Promise.all([
      supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }).eq('technician_id', id),
      supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }).eq('technician_id', id).eq('status', 'completed'),
    ]);

    const reviewCount = technician.review_count ?? 0;

    return {
      name: `${technician.first_name} ${technician.last_name}`,
      profilePicture: technician.profile_image ?? null,
      description: technician.description ?? 'No description available',
      completedOrders: Number(completedOrders ?? 0),
      totalBookings: Number(totalBookings ?? 0),
      reviews: reviewCount,
      phoneNumber: technician.phone ?? 'Not provided',
      avg_rating: technician.avg_rating ?? null,
      review_count: reviewCount,
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
