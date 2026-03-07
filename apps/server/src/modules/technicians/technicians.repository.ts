import { supabaseAdmin } from '../../shared/db/supabase.js';

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
}

/** API DTO shape returned by technician profile endpoint. */
export interface TechnicianProfile {
  name: string;
  profilePicture: string | null;
  description: string;
  completedOrders: string;
  totalBookings: string;
  reviews: string;
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
}

/** Minimal read interface required by TechniciansService (ISP). */
export interface ITechnicianQueryRepository {
  getTechniciansByCategory(categoryId: string): Promise<any[]>;
  searchTechniciansByCategory(categoryId: string, query: string): Promise<any[]>;
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
}

export class TechniciansRepository implements ITechniciansRepository {
  async getTechnicianProfile(id: string): Promise<TechnicianProfileRow | null> {
    const { data, error } = await supabaseAdmin
      .from('technicians')
      .select('id, first_name, last_name, email, phone, is_available, category_id')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data;
  }

  async getTechniciansByCategory(categoryId: string): Promise<any[]> {
    const { data, error } = await supabaseAdmin
      .from('technicians')
      .select('id, first_name, last_name, email, phone, is_available, category_id')
      .eq('category_id', categoryId)
      .order('first_name', { ascending: true });

    if (error) throw new Error(error.message);
    return data ?? [];
  }

  async searchTechniciansByCategory(categoryId: string, query: string): Promise<any[]> {
    const term = `%${query}%`;
    const { data, error } = await supabaseAdmin
      .from('technicians')
      .select('id, first_name, last_name, email, phone, is_available, category_id')
      .eq('category_id', categoryId)
      .or(`first_name.ilike.${term},last_name.ilike.${term}`)
      .order('first_name', { ascending: true });

    if (error) throw new Error(error.message);
    return data ?? [];
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
}

export const techniciansRepository = new TechniciansRepository();
