import { supabaseAdmin } from '../../shared/db/supabase.js';

const supabase = supabaseAdmin;

export interface CreateUserData {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;
  address?: string;
}

export interface UpdateUserData {
  fullName?: string;
  phone?: string;
  address?: string;
}

export class UsersRepository {
  async createUser(data: CreateUserData) {
    try {
      console.log('Creating user with data:', data);
      const { data: user, error } = await supabase
        .from('users')
        .insert({
          id: data.id,
          email: data.email,
          full_name: data.fullName,
          phone: data.phone,
          address: data.address,
        })
        .select()
        .single();

      if (error) throw error;
      console.log('Inserted user:', user);
      return user;
    } catch (error) {
      console.error('Error inserting user:', error);
      throw error;
    }
  }

  async getUserById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async getUserByEmail(email: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) throw error;
    return data;
  }

  async updateUser(id: string, data: UpdateUserData) {
    const { data: user, error } = await supabase
      .from('users')
      .update({
        full_name: data.fullName,
        phone: data.phone,
        address: data.address,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return user;
  }

  async deleteUser(id: string) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}

export const usersRepository = new UsersRepository();
