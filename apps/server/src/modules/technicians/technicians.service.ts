import type { ITechnicianQueryRepository, TechnicianProfile, TechnicianWithAddressRow } from './technicians.repository.js';
import type { ICategoriesRepository } from '../categories/categories.repository.js';
import { haversineKm } from '../../shared/utils/geo.js';
import { sortByDistance } from '../../shared/utils/sorting.js';

export interface TechnicianListDTO {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  is_available: boolean;
  category_id: string;
  city: string | null;
  street: string | null;
  distance_km: number | null;
}

export interface ITechniciansService {
  getTechniciansByCategory(categoryId: string, userLat?: number, userLng?: number): Promise<TechnicianListDTO[]>;
  searchTechniciansByCategory(categoryId: string, query: string, userLat?: number, userLng?: number): Promise<TechnicianListDTO[]>;
  getTechnicianProfile(id: string): Promise<TechnicianProfile>;
}

function toDTO(row: TechnicianWithAddressRow, userLat?: number, userLng?: number): TechnicianListDTO {
  const activeAddr = row.addresses.find((a) => a.is_active) ?? row.addresses[0] ?? null;

  let distance_km: number | null = null;
  if (userLat != null && userLng != null && activeAddr?.latitude != null && activeAddr?.longitude != null) {
    distance_km = Math.round(haversineKm(userLat, userLng, activeAddr.latitude, activeAddr.longitude) * 10) / 10;
  }

  return {
    id: row.id,
    first_name: row.first_name,
    last_name: row.last_name,
    email: row.email,
    phone: row.phone,
    is_available: row.is_available,
    category_id: row.category_id,
    city: activeAddr?.city ?? null,
    street: activeAddr?.street ?? null,
    distance_km,
  };
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
