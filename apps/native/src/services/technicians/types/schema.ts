import { z } from "zod";

/** Zod schema for a single technician item returned by the listing API. */
export const technicianListItemSchema = z.object({
  id: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  is_available: z.boolean(),
  category_id: z.string(),
  city: z.string().nullable(),
  street: z.string().nullable(),
  distance_km: z.number().nullable(),
});

/** Zod schema matching the server response: `{ technicians: [...] }`. */
export const techniciansResponseSchema = z.object({
  technicians: z.array(technicianListItemSchema),
});

/** Zod schema for a technician profile returned by the profile endpoint. */
export const technicianProfileSchema = z.object({
  name: z.string(),
  profilePicture: z.string().nullable(),
  description: z.string(),
  completedOrders: z.number(),
  totalBookings: z.number(),
  reviews: z.number(),
  phoneNumber: z.string(),
});

/** Zod schema matching the server response: `{ profile: {...} }`. */
export const technicianProfileResponseSchema = z.object({
  profile: technicianProfileSchema,
});

// Canonical types inferred from Zod schemas — single source of truth.
export type TechnicianListItem = z.infer<typeof technicianListItemSchema>;
export type TechniciansResponse = z.infer<typeof techniciansResponseSchema>;
export type TechnicianProfile = z.infer<typeof technicianProfileSchema>;
export type TechnicianProfileResponse = z.infer<typeof technicianProfileResponseSchema>;

/** @deprecated Use the canonical names above. */
export type TechnicianListItemZ = TechnicianListItem;
/** @deprecated Use the canonical names above. */
export type TechniciansResponseZ = TechniciansResponse;
/** @deprecated Use the canonical names above. */
export type TechnicianProfileZ = TechnicianProfile;
/** @deprecated Use the canonical names above. */
export type TechnicianProfileResponseZ = TechnicianProfileResponse;
