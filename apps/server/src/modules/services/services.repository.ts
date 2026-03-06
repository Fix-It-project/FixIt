import { supabaseAdmin } from '../../shared/db/supabase.js';

const SERVICE_FIELDS = 'id, name, description, min_price, max_price, category_id, created_at' as const;

export interface Service {
  id: string;
  name: string;
  description: string;
  min_price: number;
  max_price: number;
  category_id: string;
  created_at: string;
}

export interface IServicesRepository {
  getServicesByCategoryId(categoryId: string): Promise<Service[]>;
  getServiceById(id: string): Promise<Service | null>;
}

export class ServicesRepository implements IServicesRepository {
  async getServicesByCategoryId(categoryId: string): Promise<Service[]> {
    const { data, error } = await supabaseAdmin
      .from('services')
      .select(SERVICE_FIELDS)
      .eq('category_id', categoryId)
      .order('name', { ascending: true });

    if (error) throw new Error(error.message);
    return data ?? [];
  }

  async getServiceById(id: string): Promise<Service | null> {
    const { data, error } = await supabaseAdmin
      .from('services')
      .select(SERVICE_FIELDS)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }
    return data;
  }
}

export const servicesRepository = new ServicesRepository();
