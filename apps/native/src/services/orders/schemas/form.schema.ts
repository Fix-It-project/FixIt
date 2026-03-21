import { z } from 'zod';

export const bookingSchema = z.object({
  technician_id: z.string().uuid('Invalid technician ID'),
  scheduled_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  service_id: z.string().uuid('Invalid service ID'),
  problem_description: z.string().min(1, 'Description is required'),
});

export type BookingPayload = z.infer<typeof bookingSchema>;
