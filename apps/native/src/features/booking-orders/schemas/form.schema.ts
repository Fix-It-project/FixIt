import { z } from "zod";

/** Today in Cairo as YYYY-MM-DD. Bookings are next-day only, so a valid
 *  `scheduled_date` (YYYY-MM-DD) must be lexicographically greater than this. */
function cairoTodayYmd(): string {
	return new Intl.DateTimeFormat("en-CA", {
		timeZone: "Africa/Cairo",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(new Date());
}

export const bookingSchema = z.object({
	technician_id: z.uuid("Invalid technician ID"),
	scheduled_date: z.iso
		.date("Invalid date format")
		// Mirror of the DB guard (rpc_submit_order: booking_must_be_future):
		// never same-day or past, in Cairo time.
		.refine((ymd) => ymd > cairoTodayYmd(), {
			error: "Bookings must be for the next day or later.",
		}),
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