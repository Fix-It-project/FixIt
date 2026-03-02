import supabase from '../../shared/db/supabase.js';

export interface TechnicianSignUpData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  category_id: string;
}

export interface ITechnicianAuthRepository {
  signUp(data: TechnicianSignUpData): Promise<any>;
  signIn(email: string, password: string): Promise<any>;
  signOut(accessToken: string): Promise<{ success: boolean; message: string }>;
  getUser(accessToken: string): Promise<any>;
  refreshToken(refreshToken: string): Promise<any>;
}

export class TechnicianAuthRepository implements ITechnicianAuthRepository {
  // ─── Supabase Auth ────────────────────────────────────────────────────────

  async signUp({ email, password, first_name, last_name, phone }: TechnicianSignUpData) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name,
          last_name,
          phone,
          role: 'technician',
        },
      },
    });

    if (error) {
      if (
        error.message.includes('already registered') ||
        error.message.includes('already exists')
      ) {
        throw new Error('A technician with this email already exists');
      }
      throw error;
    }

    return data;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async signOut(_accessToken: string) {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true, message: 'Logged out successfully' };
  }

  async getUser(accessToken: string) {
    const { data, error } = await supabase.auth.getUser(accessToken);
    if (error) throw error;
    return data.user;
  }

  async refreshToken(refreshToken: string) {
    const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
    if (error) throw error;
    return data;
  }
}

export const technicianAuthRepository = new TechnicianAuthRepository();
