import { authRepository, type SignUpData, type SignInData } from './auth.repository.js';
import { usersRepository } from '../users/index.js';
import { addressesRepository, type SignUpAddressData } from '../addresses/index.js';

export class AuthService {
  async signUp(data: SignUpData, addressData: SignUpAddressData) {
    const result = await authRepository.signUp(data);
    
    // Store user in database
    if (result.user) {
      await usersRepository.createUser({
        id: result.user.id,
        email: data.email,
        fullName: data.fullName,
        phone: data.phone,
        address: data.address,
      });

      await addressesRepository.createAddress({
        user_id: result.user.id,
        city: addressData.city,
        street: addressData.street,
        building_no: addressData.building_no,
        apartment_no: addressData.apartment_no,
        latitude: addressData.latitude ?? null,
        longitude: addressData.longitude ?? null,
      });
    }
    
    return {
      user: {
        id: result.user?.id,
        email: result.user?.email,
      },
      message: 'User registered successfully. Please sign in to continue.',
    };
  }

  async signIn(data: SignInData) {
    const result = await authRepository.signIn(data);
    
    return {
      user: {
        id: result.user?.id,
        email: result.user?.email,
      },
      session: {
        accessToken: result.session?.access_token,
        refreshToken: result.session?.refresh_token,
        expiresAt: result.session?.expires_at,
      },
    };
  }

  async signOut(accessToken: string) {
    return await authRepository.signOut(accessToken);
  }

  async getCurrentUser(accessToken: string) {
    return await authRepository.getUser(accessToken);
  }

  async refreshSession(refreshToken: string) {
    const result = await authRepository.refreshToken(refreshToken);
    
    return {
      user: result.user,
      session: {
        accessToken: result.session?.access_token,
        refreshToken: result.session?.refresh_token,
        expiresAt: result.session?.expires_at,
      },
    };
  }

  async requestPasswordReset(email: string) {
    return await authRepository.requestPasswordReset(email);
  }

  async updatePassword(newPassword: string) {
    return await authRepository.resetPassword(newPassword);
  }
}

export const authService = new AuthService();
