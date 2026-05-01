import { usersRepository, type UpdateProfileData } from './user-auth.repository.js';

export class UsersService {
  /**
   * Returns the user row together with all related addresses.
   */
  async getProfile(userId: string) {
    return await usersRepository.getProfileWithAddresses(userId);
  }

  /**
   * Updates user profile fields (full_name, phone, email).
   * When the email changes we also update Supabase Auth so the
   * login credential stays in sync.
   */
  async updateProfile(userId: string, data: UpdateProfileData) {
    // If email is being changed, update Supabase Auth first
    if (data.email) {
      await usersRepository.updateAuthEmail(userId, data.email);
    }

    await usersRepository.updateUserProfile(userId, data);
    return await usersRepository.getProfileWithAddresses(userId);
  }
}

export const usersService = new UsersService();
