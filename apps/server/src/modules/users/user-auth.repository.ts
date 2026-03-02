import { supabaseAdmin } from '../../shared/db/supabase.js';

const supabase = supabaseAdmin;

export interface CreateUserData {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;
  
}

export interface UpdateUserData {
  fullName?: string;
  phone?: string;
  address?: string;
}

export interface UpdateProfileData {
  full_name?: string;
  email?: string;
  phone?: string;
}

export interface IUsersRepository {
  createUser(data: CreateUserData): Promise<any>;
  getUserById(id: string): Promise<any>;
  getUserByEmail(email: string): Promise<any>;
  updateUser(id: string, data: UpdateUserData): Promise<any>;
  updateUserProfile(id: string, data: UpdateProfileData): Promise<any>;
  updateAuthEmail(id: string, email: string): Promise<void>;
  getProfileWithAddresses(id: string): Promise<any>;
  deleteUser(id: string): Promise<void>;
}

export class UsersRepository implements IUsersRepository {
  async createUser(data: CreateUserData) {
    try {
      console.log('Creating user with data:', data);
      const { data: user, error } = await supabase
        .from('users')
        .insert({
          id: data.id,
          email: data.email,
          full_name: data.fullName,
          phone: data.phone
          
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

  async updateUserProfile(id: string, data: UpdateProfileData) {
    const updatePayload: Record<string, unknown> = {};
    if (data.full_name !== undefined) updatePayload.full_name = data.full_name;
    if (data.phone !== undefined) updatePayload.phone = data.phone;
    if (data.email !== undefined) updatePayload.email = data.email;

    const { data: user, error } = await supabase
      .from('users')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return user;
  }

  /**
   * Updates the user's email in Supabase Auth so login credentials stay in sync.
   */
  async updateAuthEmail(id: string, email: string) {
    const { error } = await supabase.auth.admin.updateUserById(id, { email });
    if (error) throw new Error(`Failed to update auth email: ${error.message}`);
  }

  async getProfileWithAddresses(id: string) {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (userError) throw userError;

    const { data: addresses, error: addrError } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', id)
      .order('created_at', { ascending: true });

    if (addrError) throw addrError;

    return { ...user, addresses: addresses ?? [] };
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
