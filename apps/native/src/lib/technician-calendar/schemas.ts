import { z } from "zod";

// Technician-calendar response schemas (weekly templates, single-day exceptions,
// the public availability view, and booked-slot blocking). Shared by the user
// booking flow and the technician schedule feature.

export const availabilityTemplateSchema = z.object({
	id: z.string(),
	technician_id: z.string(),
	day_of_week: z.number().int().min(0).max(6),
	slot_hour: z.number().int().nullable().optional(),
	active: z.boolean(),
});

export const calendarExceptionSchema = z.object({
	id: z.string(),
	technician_id: z.string(),
	date: z.string(),
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
export const publicScheduleResponseSchema = z.object({
	data: z.object({
		templates: z.array(availabilityTemplateSchema),
		exceptions: z.array(calendarExceptionSchema),
	}),
});

// A slot already occupied by a blocking order (Cairo-local hour).
export const bookedSlotSchema = z.object({
	date: z.string(),
	slot_hour: z.number().int(),
});
export const bookedSlotsResponseSchema = z.object({
	data: z.object({
		slots: z.array(bookedSlotSchema),
	}),
});

export type AvailabilityTemplate = z.infer<typeof availabilityTemplateSchema>;
export type CalendarException = z.infer<typeof calendarExceptionSchema>;
export type GetTemplatesResponse = z.infer<typeof getTemplatesResponseSchema>;
export type TemplateResponse = z.infer<typeof templateResponseSchema>;
export type GetExceptionsResponse = z.infer<typeof getExceptionsResponseSchema>;
export type ExceptionResponse = z.infer<typeof exceptionResponseSchema>;
export type PublicScheduleResponse = z.infer<
	typeof publicScheduleResponseSchema
>;
export type BookedSlot = z.infer<typeof bookedSlotSchema>;
