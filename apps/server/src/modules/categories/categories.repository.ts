import { supabaseAdmin } from '../../shared/db/supabase.js';

const CATEGORY_FIELDS = 'id, name, created_at' as const;

export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface ICategoriesRepository {
  getAllCategories(): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category | null>;
}

export class CategoriesRepository implements ICategoriesRepository {
  async getAllCategories(): Promise<Category[]> {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select(CATEGORY_FIELDS)
      .order('name', { ascending: true });

    if (error) throw new Error(error.message);
    return data ?? [];
  }

  async getCategoryById(id: string): Promise<Category | null> {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select(CATEGORY_FIELDS)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // row not found
      throw new Error(error.message);
    }
    return data;
  }
}

export const categoriesRepository = new CategoriesRepository();
