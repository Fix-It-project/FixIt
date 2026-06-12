import { AppError } from '../../shared/errors/app-error.js';
import { logger } from '../../shared/logger.js';
import { storageRepository, type DocumentFiles } from '../../shared/storage/storage.repository.js';
import {
  addressesRepository,
  type SignUpAddressData,
} from '../addresses/addresses.repository.js';
import { notificationsService } from '../notifications/notifications.service.js';
import { techniciansRepository } from '../technicians/technicians.repository.js';
import {
  technicianAuthRepository,
  type TechnicianSignUpData,
} from './technician-auth.repository.js';

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
    files: DocumentFiles,
    addressData: SignUpAddressData,
    expoPushToken?: string,
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
    const documentUrls = await storageRepository.uploadDocuments(technicianId, files);

    // 4. Insert row into `technicians` table
    await techniciansRepository.createTechnician({
      id: technicianId,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone,
      is_available: false, // new technicians start as unavailable until verified
      category_id: data.category_id,
      ...documentUrls,
    });

    // 5. Create address record
    await addressesRepository.createAddress({
      technician_id: technicianId,
      city: addressData.city,
      street: addressData.street,
      building_no: addressData.building_no,
      apartment_no: addressData.apartment_no,
      latitude: addressData.latitude ?? null,
      longitude: addressData.longitude ?? null,
      is_active: true,
    });

    // 6. Register the device's push token (best-effort). A pending technician
    //    can't reach the auth-gated device-register endpoint, so we capture the
    //    token here to notify them the moment an admin verifies their account.
    //    Never fails signup — token is absent on iOS / denied notif permission.
    if (expoPushToken) {
      try {
        await notificationsService.registerDevice({
          recipientRole: 'technician',
          recipientId: technicianId,
          expoPushToken,
        });
      } catch (err) {
        logger.warn(
          { err, technicianId },
          '[technician-auth] push device registration at signup failed',
        );
      }
    }

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

  /**
   * Best-effort session cleanup. A failed sign-out (network blip, missing
   * session) must never turn an intended gate result (e.g. a 403) into a 500.
   */
  private async safeSignOut(accessToken: string): Promise<void> {
    try {
      await technicianAuthRepository.signOut(accessToken);
    } catch (err) {
      logger.warn({ err }, '[technician-auth] signOut cleanup failed');
    }
  }

  async signIn(email: string, password: string) {
    let result: Awaited<ReturnType<typeof technicianAuthRepository.signIn>>;
    try {
      result = await technicianAuthRepository.signIn(email, password);
    } catch (err) {
      // Map Supabase's invalid-credentials error to a clean 401 instead of a
      // generic 500. Other failures (network, etc.) propagate unchanged.
      const message = err instanceof Error ? err.message : String(err);
      if (/invalid login credentials|invalid_credentials/i.test(message)) {
        throw AppError.unauthorized('Invalid email or password');
      }
      throw err;
    }

    // Guard: reject if this email belongs to a user, not a technician
    const techRecord = await techniciansRepository.getTechnicianByEmail(email);
    if (!techRecord) {
      await this.safeSignOut(result.session?.access_token ?? '');
      throw AppError.forbidden('No technician account found for this email');
    }

    // Verification gate: only verified technicians may log in. New signups are
    // 'pending' until an admin verifies them; 'blocked'/'rejected' stay out.
    const record = techRecord as { status?: string; blocked_reason?: string | null };
    const status = record.status ?? 'pending';
    if (status !== 'verified') {
      await this.safeSignOut(result.session?.access_token ?? '');
      const message =
        status === 'pending'
          ? 'Your account is pending admin verification. Please wait for approval.'
          : status === 'blocked'
            ? 'Your account has been blocked. Contact support for assistance.'
            : 'Your application was not approved.';
      // Machine-readable status discriminator for the native verification/blocked
      // screens. Carried via the existing `fields` slot (round-trips through
      // problem+json) so the client renders the right state without parsing text.
      throw AppError.forbidden(message, {
        fields: {
          accountStatus: status,
          ...(status === 'blocked' && record.blocked_reason
            ? { blockReason: record.blocked_reason }
            : {}),
        },
      });
    }

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

  // ─── Cancel application ───────────────────────────────────────────────────

  /**
   * Withdraws a PENDING technician's application and hard-deletes everything
   * created at signup. The applicant has no session, so we re-authenticate with
   * their password first, then remove the auth user (which frees the email for
   * re-signup) followed by a best-effort cleanup of the remaining artifacts.
   */
  async cancelApplication(email: string, password: string) {
    // Re-auth confirms identity (signIn at the repo level succeeds for pending).
    const result = await technicianAuthRepository.signIn(email, password);
    const accessToken = result.session?.access_token ?? '';
    const userId = result.user?.id;

    const techRecord = await techniciansRepository.getTechnicianByEmail(email);
    const status = (techRecord as { status?: string } | null)?.status;
    if (!techRecord || status !== 'pending') {
      await this.safeSignOut(accessToken);
      throw AppError.forbidden('Only a pending application can be cancelled');
    }
    if (!userId) {
      await this.safeSignOut(accessToken);
      throw AppError.internal('Could not resolve technician account');
    }

    // Critical first: removing the auth user frees the email for re-signup.
    await technicianAuthRepository.deleteAuthUser(userId);

    // Best-effort cleanup — a single failure is logged but never blocks cancel.
    const cleanup: Array<[string, () => Promise<unknown>]> = [
      ['documents', () => storageRepository.deleteDocuments(userId)],
      ['notifications', () => notificationsService.removeAllForRecipient('technician', userId)],
      ['addresses', () => addressesRepository.deleteByTechnicianId(userId)],
      ['technician', () => techniciansRepository.deleteTechnician(userId)],
    ];
    for (const [step, run] of cleanup) {
      try {
        await run();
      } catch (err) {
        logger.warn(
          { err, technicianId: userId, step },
          '[technician-auth] cancel cleanup step failed',
        );
      }
    }

    logger.info({ technicianId: userId }, '[technician-auth] application cancelled');
    return { cancelled: true };
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

    // Re-gate the refresh so a blocked technician can't silently renew its
    // session for days (fail-open on read error). block_pending passes.
    const techId = result.user?.id;
    if (techId) {
      let blocked = false;
      try {
        const rec = await techniciansRepository.getTechnicianById(techId);
        blocked = (rec as { status?: string } | null)?.status === 'blocked';
      } catch {
        // fail-open
      }
      if (blocked) {
        throw AppError.forbidden(
          'Your account has been blocked. Contact support for assistance.',
          { fields: { accountStatus: 'blocked' } },
        );
      }
    }

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
