/**
 * Query keys used by the techhome feature.
 *
 * Shared keys are mirrored VERBATIM from their owning features (cross-feature
 * imports are banned; the string contract is the interface):
 * - ["technician-bookings", userId] — booking-orders orderQueryKeys.technicianBookingsFor
 * - ["technician", "self"]          — tech-self useTechSelfProfileQuery
 * - ["notification-unread-count", "technician"] — notifications feature
 * - ["dashboard-orders"]            — legacy dashboard feature (invalidated defensively)
 * - ["schedule-events"]             — schedule feature (invalidated on accept/decline)
 */
export const techHomeKeys = {
	stats: ["tech-home-stats"] as const,
	ordersFor: (userId: string | undefined) =>
		["technician-bookings", userId] as const,
	orders: ["technician-bookings"] as const,
	self: ["technician", "self"] as const,
	unreadCount: ["notification-unread-count", "technician"] as const,
	legacyDashboardOrders: ["dashboard-orders"] as const,
	scheduleEvents: ["schedule-events"] as const,
} as const;
