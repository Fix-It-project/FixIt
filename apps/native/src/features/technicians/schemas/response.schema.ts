import { z } from "zod";

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

export const techniciansResponseSchema = z.object({
  technicians: z.array(technicianListItemSchema),
});

export const technicianProfileSchema = z.object({
  name: z.string(),
  profilePicture: z.string().nullable(),
  description: z.string(),
  completedOrders: z.number(),
  totalBookings: z.number(),
  reviews: z.number(),
  phoneNumber: z.string(),
});

export const technicianProfileResponseSchema = z.object({
  profile: technicianProfileSchema,
});

export type TechnicianListItem = z.infer<typeof technicianListItemSchema>;
export type TechniciansResponse = z.infer<typeof techniciansResponseSchema>;
export type TechnicianProfile = z.infer<typeof technicianProfileSchema>;
export type TechnicianProfileResponse = z.infer<typeof technicianProfileResponseSchema>;

export const recommendedTechnicianSchema = z.object({
  technician_id: z.union([z.string(), z.number()]).transform(String),
  name: z.string(),
  category: z.string().nullable().optional(),
  distance_km: z.number().nullable().optional(),
  match_score: z.number().nullable().optional(),
  market_trust_score: z.number().nullable().optional(),
  base_hourly_rate: z.number().nullable().optional(),
});

export const recommendationsResponseSchema = z.object({
  recommendations: z.array(recommendedTechnicianSchema),
});

export type RecommendedTechnicianApi = z.infer<typeof recommendedTechnicianSchema>;
export type RecommendationsResponse = z.infer<typeof recommendationsResponseSchema>;