import { z } from "zod";

export const bookingSchema = z.object({
	technician_id: z.uuid("Invalid technician ID"),
	scheduled_date: z.iso.date("Invalid date format"),
	scheduled_start_at: z.iso.datetime({
		offset: true,
		error: "Invalid start time",
	}),
	service_id: z.uuid("Invalid service ID"),
	// Mandatory: drives the lifecycle (cash completes off-site; card routes through
	// awaiting_payment) and is shown to the technician on the request.
	payment_method: z.enum(["cash", "card"]),
	problem_description: z.string().optional(),
	destination_address_id: z.uuid("Invalid address ID").optional(),
});

export type BookingPayload = z.infer<typeof bookingSchema>;