import { z } from "zod";

export const rescheduleResolutionSchema = z.enum([
	"pending",
	"approved",
	"rejected",
	"withdrawn",
]);
export type RescheduleResolution = z.infer<typeof rescheduleResolutionSchema>;

export const rescheduleRequestSchema = z.object({
	id: z.string(),
	order_id: z.string(),
	requested_by: z.enum(["user", "technician"]),
	original_scheduled_date: z.string(),
	proposed_scheduled_date: z.string(),
	request_reason: z.string(),
	reject_reason: z.string().nullable(),
	resolution: rescheduleResolutionSchema,
	response_window_hours: z.number(),
	created_at: z.string(),
	resolved_at: z.string().nullable(),
});
export type RescheduleRequestModel = z.infer<typeof rescheduleRequestSchema>;

export const rescheduleResponseSchema = z.object({
	data: rescheduleRequestSchema,
});
export type RescheduleResponse = z.infer<typeof rescheduleResponseSchema>;

export const rescheduleNullableResponseSchema = z.object({
	data: rescheduleRequestSchema.nullable(),
});
export type RescheduleNullableResponse = z.infer<
	typeof rescheduleNullableResponseSchema
>;
