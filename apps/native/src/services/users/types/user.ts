// ─── User Profile Types ──────────────────────────────────────────────────────

export interface UserAddress {
  id: string;
  user_id: string;
  city: string;
  street: string;
  building_no: string;
  apartment_no: string;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  addresses: UserAddress[];
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
