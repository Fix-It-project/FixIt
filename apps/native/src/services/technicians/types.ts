/** Response shape for a single technician in a category listing. */
export interface TechnicianListItem {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  is_available: boolean;
  category_id: string;
}

/**
 * The server controller returns `{ technicians: TechnicianListItem[] }`.
 */
export interface TechniciansResponse {
  technicians: TechnicianListItem[];
}
