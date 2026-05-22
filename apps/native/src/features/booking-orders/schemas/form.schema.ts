import { z } from "zod";

export const bookingSchema = z.object({
	technician_id: z.uuid("Invalid technician ID"),
	scheduled_date: z.iso.date("Invalid date format"),
	scheduled_start_at: z.iso.datetime("Invalid start time").optional(),
	service_id: z.uuid("Invalid service ID"),
	problem_description: z.string().optional(),
	destination_address_id: z.uuid("Invalid address ID").optional(),
});

export type BookingPayload = z.infer<typeof bookingSchema>;
