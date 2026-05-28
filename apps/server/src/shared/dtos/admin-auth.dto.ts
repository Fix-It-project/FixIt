import { z } from 'zod';

export const AdminLoginBodySchema = z.object({
  email: z.string().email('Must be a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export type AdminLoginBody = z.infer<typeof AdminLoginBodySchema>;
