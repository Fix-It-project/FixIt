import apiClient from "@/src/lib/api-client";
import { techniciansResponseSchema, technicianProfileResponseSchema } from "./schema";
import type { TechnicianListItem, TechniciansResponse, TechnicianProfile, TechnicianProfileResponse } from "./types";

/**
 * Fetch all technicians belonging to a given category.
 * GET /api/categories/:categoryId/technicians
 *
 * Server responds with `{ technicians: [...] }` — we validate and unwrap.
 */
export async function getTechniciansByCategory(
  categoryId: string,
): Promise<TechnicianListItem[]> {
  const { data } = await apiClient.get<TechniciansResponse>(
    `/api/categories/${categoryId}/technicians`,
  );
  const validated = techniciansResponseSchema.parse(data);
  return validated.technicians;
}

/**
 * Search technicians within a category by name.
 * GET /api/categories/:categoryId/technicians/search?q=<term>
 *
 * Server responds with `{ technicians: [...] }` — we validate and unwrap.
 */
export async function searchTechniciansInCategory(
  categoryId: string,
  query: string,
): Promise<TechnicianListItem[]> {
  const { data } = await apiClient.get<TechniciansResponse>(
    `/api/categories/${categoryId}/technicians/search`,
    { params: { q: query } },
  );
  const validated = techniciansResponseSchema.parse(data);
  return validated.technicians;
}

/**
 * Fetch a technician's profile card data.
 * GET /api/technicians/:id/profile
 *
 * Server responds with `{ profile: {...} }` — we validate and unwrap.
 */
export async function getTechnicianProfile(
  technicianId: string,
): Promise<TechnicianProfile> {
  const { data } = await apiClient.get<TechnicianProfileResponse>(
    `/api/technicians/${technicianId}/profile`,
  );
  const validated = technicianProfileResponseSchema.parse(data);
  return validated.profile;
}

