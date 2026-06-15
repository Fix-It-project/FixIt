import { z } from "zod";

// A technician's custom-service request. A row starts as `pending`; on admin
// approval the same row becomes `approved` and is published as a bookable
// catalog service (the server stamps `published_service_id`).
export const serviceRequestStatusSchema = z.enum([
	"pending",
	"approved",
	"rejected",
]);

export const customServiceRequestSchema = z.object({
	id: z.string(),
	technician_id: z.string(),
	category_id: z.string().nullable(),
	name: z.string(),
	description: z.string().nullable(),
	min_price: z.number(),
	max_price: z.number(),
	status: serviceRequestStatusSchema,
	reject_reason: z.string().nullable(),
	reviewed_by: z.string().nullable(),
	reviewed_at: z.string().nullable(),
	published_service_id: z.string().nullable().optional(),
	created_at: z.string(),
});

export const submitServiceRequestResponseSchema = z.object({
	request: customServiceRequestSchema,
});

export const myServiceRequestsResponseSchema = z.object({
	requests: z.array(customServiceRequestSchema),
});

export type ServiceRequestStatus = z.infer<typeof serviceRequestStatusSchema>;
export type CustomServiceRequest = z.infer<typeof customServiceRequestSchema>;
