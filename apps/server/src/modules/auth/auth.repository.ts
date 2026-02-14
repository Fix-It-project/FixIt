import supabase from '../../shared/db/supabase.js';

export interface SignUpData {
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
  address?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export class AuthRepository {
  async signUp({ email, password, fullName, phone, address }: SignUpData) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone,
          address: address,
        },
      },
    });

    if (error) {
      if (
        error.message.includes('already registered') ||
        error.message.includes('already exists')
      ) {
        throw new Error('User with this email already exists');
      }
      throw error;
    }

    return data;
  }

  async signIn({ email, password }: SignInData) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  async requestPasswordReset(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `http://localhost:8081`, // Adjust this URL to your frontend reset password page
      });
      
    if (error){
      console.error('Supabase error details:', {
        message: error.message,
        status: error.status,
        name: error.name
      });
      throw error;
    }

      
      return data;
  }

  async resetPassword(newPassword: string) {
    const { data, error } = await supabase.auth.updateUser( {
      password: newPassword,
    });

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
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error) throw error;
    return data;
  }
}

export const authRepository = new AuthRepository();
