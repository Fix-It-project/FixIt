import { z } from "zod";
import { orderStatusSchema } from "@/src/schemas/shared.schema";

export const availabilityTemplateSchema = z.object({
  id: z.string(),
  technician_id: z.string(),
  day_of_week: z.number().int().min(0).max(6),
  active: z.boolean(),
});

export const calendarExceptionSchema = z.object({
  id: z.string(),
  technician_id: z.string(),
  date: z.string(),
  created_at: z.string(),
});

export const technicianOrderSchema = z.object({
  id: z.string(),
  technician_id: z.string(),
  user_id: z.string(),
  service_id: z.string(),
  status: orderStatusSchema,
  problem_description: z.string().nullable(),
  scheduled_date: z.string(),
  active: z.boolean(),
  created_at: z.string(),
});

export const getTemplatesResponseSchema = z.object({
  data: z.array(availabilityTemplateSchema),
});
export const templateResponseSchema = z.object({
  data: availabilityTemplateSchema,
});
export const getExceptionsResponseSchema = z.object({
  data: z.array(calendarExceptionSchema),
});
export const exceptionResponseSchema = z.object({
  data: calendarExceptionSchema,
});
export const getTechnicianOrdersResponseSchema = z.object({
  data: z.array(technicianOrderSchema),
});
export const publicScheduleResponseSchema = z.object({
  data: z.object({
    templates: z.array(availabilityTemplateSchema),
    exceptions: z.array(calendarExceptionSchema),
  }),
});

export type AvailabilityTemplate = z.infer<typeof availabilityTemplateSchema>;
export type CalendarException = z.infer<typeof calendarExceptionSchema>;
export type TechnicianOrder = z.infer<typeof technicianOrderSchema>;
export type GetTemplatesResponse = z.infer<typeof getTemplatesResponseSchema>;
export type TemplateResponse = z.infer<typeof templateResponseSchema>;
export type GetExceptionsResponse = z.infer<typeof getExceptionsResponseSchema>;
export type ExceptionResponse = z.infer<typeof exceptionResponseSchema>;
export type GetTechnicianOrdersResponse = z.infer<typeof getTechnicianOrdersResponseSchema>;
export type PublicScheduleResponse = z.infer<typeof publicScheduleResponseSchema>;
