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
});

/** Zod schema matching the server response: `{ technicians: [...] }`. */
export const techniciansResponseSchema = z.object({
  technicians: z.array(technicianListItemSchema),
});

export type TechnicianListItemZ = z.infer<typeof technicianListItemSchema>;
export type TechniciansResponseZ = z.infer<typeof techniciansResponseSchema>;
