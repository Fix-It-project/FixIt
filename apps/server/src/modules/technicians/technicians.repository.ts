import { supabaseAdmin } from '../../shared/db/supabase.js';
import { distanceKm } from '../../shared/utils/technicians/index.js';

export interface CreateTechnicianData {
  id: string;           // Must match the auth.users ID
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  is_available?: boolean;
  category_id: string;        // UUID foreign key → categories table
  criminal_record?: string;   // Supabase storage URL
  birth_certificate?: string; // Supabase storage URL
  national_id?: string;       // Supabase storage URL
}

export interface UpdateTechnicianData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  is_available?: boolean;
  criminal_record?: string;
  birth_certificate?: string;
  national_id?: string;
  description?: string;
}

/** Self-profile shape returned to the authenticated technician. */
export interface TechnicianSelfProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  profile_image: string | null;
  description: string | null;
  category_name: string | null;
  total_orders: number;
  completed_orders: number;
}

export interface UpdateTechnicianSelfData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  description?: string;
}

/** API DTO shape returned by technician profile endpoint. */
export interface TechnicianProfile {
  name: string;
  profilePicture: string | null;
  description: string;
  completedOrders: number;
  totalBookings: number;
  reviews: number;
  phoneNumber: string;
}

/** Raw row shape selected for profile hydration. */
export interface TechnicianProfileRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  is_available: boolean;
  category_id: string;
  profile_image: string | null;
  description: string | null;
}

/** Row shape returned when listing technicians with their active address. */
export interface TechnicianWithAddressRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  is_available: boolean;
  category_id: string;
  addresses: Array<{
    city: string;
    street: string;
    latitude: number | null;
    longitude: number | null;
    is_active: boolean;
  }>;
}

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

export function toDTO(row: TechnicianWithAddressRow, userLat?: number, userLng?: number): TechnicianListDTO {
  const activeAddr = row.addresses.find((a) => a.is_active) ?? row.addresses[0] ?? null;

  let distance_km: number | null = null;
  if (userLat != null && userLng != null && activeAddr?.latitude != null && activeAddr?.longitude != null) {
    distance_km = distanceKm(userLat, userLng, activeAddr.latitude, activeAddr.longitude);
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

/** Minimal read interface required by TechniciansService (ISP). */
export interface ITechnicianQueryRepository {
  getTechniciansByCategory(categoryId: string): Promise<TechnicianWithAddressRow[]>;
  searchTechniciansByCategory(categoryId: string, query: string): Promise<TechnicianWithAddressRow[]>;
  getTechnicianProfile(id: string): Promise<TechnicianProfileRow | null>;
}

/** Full CRUD interface — used by modules that manage technician records. */
export interface ITechniciansRepository extends ITechnicianQueryRepository {
  createTechnician(data: CreateTechnicianData): Promise<any>;
  getTechnicianById(id: string): Promise<any>;
  getTechnicianByEmail(email: string): Promise<any>;
  emailExists(email: string): Promise<boolean>;
  updateTechnician(id: string, data: UpdateTechnicianData): Promise<any>;
  deleteTechnician(id: string): Promise<void>;
  getTechnicianSelf(id: string): Promise<TechnicianSelfProfile | null>;
  updateTechnicianSelf(id: string, data: UpdateTechnicianSelfData): Promise<any>;
  updateProfileImage(id: string, url: string): Promise<any>;
}

export class TechniciansRepository implements ITechniciansRepository {
  async getTechnicianProfile(id: string): Promise<TechnicianProfileRow | null> {
    const { data, error } = await supabaseAdmin
      .from('technicians')
      .select('id, first_name, last_name, email, phone, is_available, category_id, profile_image, description')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data;
  }

  async getTechniciansByCategory(categoryId: string): Promise<TechnicianWithAddressRow[]> {
    const { data, error } = await supabaseAdmin
      .from('technicians')
      .select('id, first_name, last_name, email, phone, is_available, category_id, addresses(city, street, latitude, longitude, is_active)')
      .eq('category_id', categoryId)
      .order('first_name', { ascending: true });

    if (error) throw new Error(error.message);
    return (data ?? []) as TechnicianWithAddressRow[];
  }

  async searchTechniciansByCategory(categoryId: string, query: string): Promise<TechnicianWithAddressRow[]> {
    const term = `%${query}%`;
    const { data, error } = await supabaseAdmin
      .from('technicians')
      .select('id, first_name, last_name, email, phone, is_available, category_id, addresses(city, street, latitude, longitude, is_active)')
      .eq('category_id', categoryId)
      .or(`first_name.ilike.${term},last_name.ilike.${term}`)
      .order('first_name', { ascending: true });

    if (error) throw new Error(error.message);
    return (data ?? []) as TechnicianWithAddressRow[];
  }

  async createTechnician(data: CreateTechnicianData) {
    try {
      console.log('Creating technician with data:', { ...data, criminal_record: '[file]', birth_certificate: '[file]', national_id: '[file]' });

      const { data: technician, error } = await supabaseAdmin
        .from('technicians')
        .insert({
          id: data.id,
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone ?? null,
          is_available: data.is_available ?? false,
          category_id: data.category_id,
          criminal_record: data.criminal_record ?? null,
          birth_certificate: data.birth_certificate ?? null,
          national_id: data.national_id ?? null,
        })
        .select()
        .single();

      if (error) throw error;
      console.log('Inserted technician:', technician);
      return technician;
    } catch (error) {
      console.error('Error inserting technician:', error);
      throw error;
    }
  }

  async getTechnicianById(id: string) {
    const { data, error } = await supabaseAdmin
      .from('technicians')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async getTechnicianByEmail(email: string) {
    const { data, error } = await supabaseAdmin
      .from('technicians')
      .select('*')
      .eq('email', email)
      .maybeSingle(); // returns null instead of error when not found

    if (error) throw error;
    return data; // null if not found
  }

  async emailExists(email: string): Promise<boolean> {
    const { count, error } = await supabaseAdmin
      .from('technicians')
      .select('*', { count: 'exact', head: true })
      .eq('email', email);

    if (error) throw error;
    return (count ?? 0) > 0;
  }

  async updateTechnician(id: string, data: UpdateTechnicianData) {
    const { data: technician, error } = await supabaseAdmin
      .from('technicians')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return technician;
  }

  async deleteTechnician(id: string) {
    const { error } = await supabaseAdmin
      .from('technicians')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getTechnicianSelf(id: string): Promise<TechnicianSelfProfile | null> {
    const { data, error } = await supabaseAdmin
      .from('technicians')
      .select('id, first_name, last_name, email, phone, profile_image, description, categories(name)')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;

    const [{ count: totalOrders }, { count: completedOrders }] = await Promise.all([
      supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }).eq('technician_id', id),
      supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }).eq('technician_id', id).eq('status', 'completed'),
    ]);

    const categoriesRaw = data.categories as unknown as { name: string }[] | { name: string } | null;
    const categories = Array.isArray(categoriesRaw) ? categoriesRaw[0] ?? null : categoriesRaw;

    return {
      id: data.id,
      first_name: data.first_name ?? '',
      last_name: data.last_name ?? '',
      email: data.email ?? '',
      phone: data.phone ?? null,
      profile_image: data.profile_image ?? null,
      description: data.description ?? null,
      category_name: categories?.name ?? null,
      total_orders: totalOrders ?? 0,
      completed_orders: completedOrders ?? 0,
    };
  }

  async updateTechnicianSelf(id: string, data: UpdateTechnicianSelfData) {
    const payload: Partial<UpdateTechnicianSelfData> = {};
    if (data.first_name !== undefined) payload.first_name = data.first_name;
    if (data.last_name !== undefined) payload.last_name = data.last_name;
    if (data.phone !== undefined) payload.phone = data.phone;
    if (data.description !== undefined) payload.description = data.description;

    const { data: technician, error } = await supabaseAdmin
      .from('technicians')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return technician;
  }

  async updateProfileImage(id: string, url: string) {
    const { data: technician, error } = await supabaseAdmin
      .from('technicians')
      .update({ profile_image: url })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return technician;
  }
}

export const techniciansRepository = new TechniciansRepository();
