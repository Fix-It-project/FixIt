import { z } from 'zod';

export const CreateOrderBodySchema = z.object({
  technician_id: z.string().uuid('technician_id must be a valid UUID'),
  service_id: z.string().uuid('service_id must be a valid UUID'),
  scheduled_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'scheduled_date must be in YYYY-MM-DD format'),
  problem_description: z.string().optional(),
});

export const UserUpdateOrderBodySchema = z.object({
  cancel: z.boolean().optional(),
  cancellation_reason: z.string().optional(),
});

export const TechnicianUpdateOrderBodySchema = z.object({
  status: z.enum(['accepted', 'rejected', 'cancelled_by_technician', 'completed']).optional(),
  cancellation_reason: z.string().optional(),
});

export const OrderIdParamsSchema = z.object({
  id: z.string().uuid('Order ID must be a valid UUID'),
});

export type CreateOrderBody = z.infer<typeof CreateOrderBodySchema>;
export type UserUpdateOrderBody = z.infer<typeof UserUpdateOrderBodySchema>;
export type TechnicianUpdateOrderBody = z.infer<typeof TechnicianUpdateOrderBodySchema>;
export type OrderIdParams = z.infer<typeof OrderIdParamsSchema>;
