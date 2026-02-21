import { supabaseAdmin } from '../../shared/db/supabase.js';

const supabase = supabaseAdmin;

export interface CreateTechnicianData {
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

export class TechniciansRepository {
  async createTechnician(data: CreateTechnicianData) {
    try {
      console.log('Creating technician with data:', { ...data, criminal_record: '[file]', birth_certificate: '[file]', national_id: '[file]' });

      const { data: technician, error } = await supabase
        .from('technicians')
        .insert({
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
    const { data, error } = await supabase
      .from('technicians')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async getTechnicianByEmail(email: string) {
    const { data, error } = await supabase
      .from('technicians')
      .select('*')
      .eq('email', email)
      .maybeSingle(); // returns null instead of error when not found

    if (error) throw error;
    return data; // null if not found
  }

  async emailExists(email: string): Promise<boolean> {
    const { count, error } = await supabase
      .from('technicians')
      .select('*', { count: 'exact', head: true })
      .eq('email', email);

    if (error) throw error;
    return (count ?? 0) > 0;
  }

  async updateTechnician(id: string, data: UpdateTechnicianData) {
    const { data: technician, error } = await supabase
      .from('technicians')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return technician;
  }

  async deleteTechnician(id: string) {
    const { error } = await supabase
      .from('technicians')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}

export const techniciansRepository = new TechniciansRepository();
