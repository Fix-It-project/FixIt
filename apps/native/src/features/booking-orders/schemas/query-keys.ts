// Centralized TanStack query keys for the booking-orders feature.
//
// Viewer-scoped entries (`orderQuotes`, `orderDistance`) MUST include the
// viewer so a user-side cached payload is never served to a technician.

export const orderQueryKeys = {
	userOrders: ["user-orders"] as const,
	technicianBookings: ["technician-bookings"] as const,
	technicianBookingsFor: (userId: string | undefined) =>
		["technician-bookings", userId] as const,
	inspectionFeePreview: (technicianId: string, destinationAddressId: string) =>
		["inspection-fee-preview", technicianId, destinationAddressId] as const,
	orderQuotes: (orderId: string, viewer: "user" | "technician") =>
		["order-quotes", viewer, orderId] as const,
	orderDistance: (orderId: string, viewer: "user" | "technician") =>
		["order-distance", viewer, orderId] as const,
	orderReschedule: (orderId: string, viewer?: "user" | "technician") =>
		viewer
			? (["order-reschedule", orderId, viewer] as const)
			: (["order-reschedule", orderId] as const),
} as const;
