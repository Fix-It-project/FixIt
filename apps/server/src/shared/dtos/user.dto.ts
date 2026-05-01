import { z } from 'zod';

export const UpdateUserProfileBodySchema = z.object({
  full_name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
}).refine(
  (data) => data.full_name !== undefined || data.email !== undefined || data.phone !== undefined,
  { message: 'At least one of full_name, email, or phone must be provided' },
);

export type UpdateUserProfileBody = z.infer<typeof UpdateUserProfileBodySchema>;
