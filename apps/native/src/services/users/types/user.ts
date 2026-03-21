// ─── User Profile Types ──────────────────────────────────────────────────────

import type { Address } from '@/src/services/addresses/types';

/**
 * @deprecated Use `Address` from `@/src/services/addresses/types` directly.
 * Kept as an alias for backward compatibility.
 */
export type UserAddress = Address;

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  addresses: Address[];
}

export interface GetProfileResponse {
  profile: UserProfile;
}

export interface UpdateProfileRequest {
  full_name?: string;
  email?: string;
  phone?: string;
}

export interface UpdateProfileResponse {
  profile: UserProfile;
}
