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
