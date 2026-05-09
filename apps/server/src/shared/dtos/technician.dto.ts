import { z } from 'zod';

export const TechnicianSortSchema = z.enum(['top_rated', 'most_reviews']);
export type TechnicianSort = z.infer<typeof TechnicianSortSchema>;

export const TechnicianListQuerySchema = z.object({
  sort: TechnicianSortSchema.optional(),
  // Note: lat/lng/q are read directly from req.query elsewhere; do not move them here in this phase.
});
export type TechnicianListQuery = z.infer<typeof TechnicianListQuerySchema>;

export const UpdateTechnicianSelfBodySchema = z.object({
  first_name: z.string().min(1).optional(),
  last_name: z.string().min(1).optional(),
  phone: z.string().optional(),
  description: z.string().optional(),
}).refine(
  (data) => Object.values(data).some((v) => v !== undefined),
  { message: 'At least one field (first_name, last_name, phone, description) is required' },
);

export const TechnicianIdParamsSchema = z.object({
  id: z.string().uuid('Technician ID must be a valid UUID'),
});

export type UpdateTechnicianSelfBody = z.infer<typeof UpdateTechnicianSelfBodySchema>;
