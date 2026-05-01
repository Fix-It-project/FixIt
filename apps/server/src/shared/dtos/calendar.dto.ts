import { z } from 'zod';

export const CreateCalendarEntryBodySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be in YYYY-MM-DD format'),
});

export const UpdateCalendarEntryBodySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be in YYYY-MM-DD format').optional(),
});

export const CreateTemplateBodySchema = z.object({
  day_of_week: z.number().int().min(0).max(6, 'day_of_week must be 0–6'),
  active: z.boolean().optional(),
});

export const UpdateTemplateBodySchema = z.object({
  day_of_week: z.number().int().min(0).max(6).optional(),
  active: z.boolean().optional(),
});

export const CalendarQuerySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const TechnicianCalendarParamsSchema = z.object({
  technicianId: z.string().uuid('technicianId must be a valid UUID'),
});

export const CalendarEntryParamsSchema = z.object({
  technicianId: z.string().uuid('technicianId must be a valid UUID'),
  id: z.string().uuid('Entry ID must be a valid UUID'),
});

export type CreateCalendarEntryBody = z.infer<typeof CreateCalendarEntryBodySchema>;
export type CreateTemplateBody = z.infer<typeof CreateTemplateBodySchema>;
export type CalendarQuery = z.infer<typeof CalendarQuerySchema>;
