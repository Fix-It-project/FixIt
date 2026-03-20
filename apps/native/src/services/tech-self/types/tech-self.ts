import { z } from "zod";

// ─── Schema & Types ───────────────────────────────────────────────────────────

export const technicianSelfProfileSchema = z.object({
  id: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  profile_image: z.string().nullable(),
  description: z.string().nullable(),
  category_name: z.string().nullable(),
  total_orders: z.number(),
  completed_orders: z.number(),
});

export const technicianSelfResponseSchema = z.object({
  profile: technicianSelfProfileSchema,
});

export type TechnicianSelfProfile = z.infer<typeof technicianSelfProfileSchema>;

export interface UpdateTechnicianSelfRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  description?: string;
}
