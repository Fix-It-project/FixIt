/** Response shape for a single technician in a category listing. */
export interface TechnicianListItem {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  is_available: boolean;
  category_id: string;
  city: string | null;
  street: string | null;
  distance_km: number | null;
}

/**
 * The server controller returns `{ technicians: TechnicianListItem[] }`.
 */
export interface TechniciansResponse {
  technicians: TechnicianListItem[];
}

/** Shape of a technician profile returned by the profile endpoint. */
export interface TechnicianProfile {
  name: string;
  profilePicture: string | null;
  description: string;
  completedOrders: string;
  totalBookings: string;
  reviews: string;
  phoneNumber: string;
}

/**
 * The server controller returns `{ profile: TechnicianProfile }`.
 */
export interface TechnicianProfileResponse {
  profile: TechnicianProfile;
}

