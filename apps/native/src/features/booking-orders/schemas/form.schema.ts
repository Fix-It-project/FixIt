import { z } from "zod";

export const bookingSchema = z.object({
	technician_id: z.uuid("Invalid technician ID"),
	scheduled_date: z.iso.date("Invalid date format"),
	service_id: z.uuid("Invalid service ID"),
	problem_description: z.string().optional(),
});

export type BookingPayload = z.infer<typeof bookingSchema>;
