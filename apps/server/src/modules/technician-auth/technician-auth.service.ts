import {
  technicianAuthRepository,
  type TechnicianSignUpData,
  type TechnicianDocumentFiles,
} from './technician-auth.repository.js';
import { techniciansRepository } from '../technicians/index.js';

export class TechnicianAuthService {
  // ─── Check email ──────────────────────────────────────────────────────────

  /**
   * Returns true if a technician with this email already exists in the
   * `technicians` table, false otherwise.
   */
  async checkEmailExists(email: string): Promise<boolean> {
    return techniciansRepository.emailExists(email);
  }

  // ─── Sign up ──────────────────────────────────────────────────────────────

  /**
   * 1. Creates a Supabase Auth user.
   * 2. Uploads the three document files to Supabase Storage (in parallel).
   * 3. Inserts a row into the `technicians` table.
   */
  async signUp(
    data: TechnicianSignUpData,
    files: TechnicianDocumentFiles,
  ) {
    // 1. Guard: reject if email already taken for a technician
    const alreadyExists = await techniciansRepository.emailExists(data.email);
    if (alreadyExists) {
      throw new Error('A technician with this email already exists');
    }

    // 2. Create Supabase Auth user
    const authResult = await technicianAuthRepository.signUp(data);

    const technicianId = authResult.user?.id;
    if (!technicianId) {
      throw new Error('Failed to create technician account');
    }

    // 3. Upload documents to Supabase Storage (parallel)
    const documentUrls = await technicianAuthRepository.uploadDocuments(technicianId, files);

    // 4. Insert row into `technicians` table
    await techniciansRepository.createTechnician({
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone,
      is_available: false, // new technicians start as unavailable until verified
      category_id: data.category_id,
      ...documentUrls,
    });

    return {
      technician: {
        id: technicianId,
        email: authResult.user?.email,
        first_name: data.first_name,
        last_name: data.last_name,
      },
      message: 'Technician registered successfully. Please sign in to continue.',
    };
  }

  // ─── Sign in ──────────────────────────────────────────────────────────────

  async signIn(email: string, password: string) {
    const result = await technicianAuthRepository.signIn(email, password);

    return {
      technician: {
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

  // ─── Sign out ─────────────────────────────────────────────────────────────

  async signOut(accessToken: string) {
    return technicianAuthRepository.signOut(accessToken);
  }

  // ─── Get current technician ───────────────────────────────────────────────

  async getCurrentTechnician(accessToken: string) {
    return technicianAuthRepository.getUser(accessToken);
  }

  // ─── Refresh session ──────────────────────────────────────────────────────

  async refreshSession(refreshToken: string) {
    const result = await technicianAuthRepository.refreshToken(refreshToken);

    return {
      technician: result.user,
      session: {
        accessToken: result.session?.access_token,
        refreshToken: result.session?.refresh_token,
        expiresAt: result.session?.expires_at,
      },
    };
  }

}

export const technicianAuthService = new TechnicianAuthService();
