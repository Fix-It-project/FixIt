// Booking-orders hooks barrel.
//
// Existing hooks (pre-Phase-4a):
export * from "./useArrivalGeofence";
export * from "./useCreateBooking";
export * from "./useInspectionFeePreview";
export * from "./useOrderDistance";
export * from "./useOrderLifecycleMutations";
export * from "./useOrderQuoteHistory";
// Phase 4c Plan 06 — Realtime invalidation hook:
export { useOrderRealtimeInvalidate } from "./useOrderRealtimeInvalidate";
export * from "./useOrderRescheduleQuery";
export * from "./usePublicSchedule";
export * from "./useTechActiveOrder";
export type {
	UseTechLocationPingOptions,
	UseTechLocationPingResult,
} from "./useTechLocationPing";
// Phase 4c Plan 02 — location ping hook:
export { useTechLocationPing } from "./useTechLocationPing";
// Background tracking (foreground + OS background via expo-task-manager):
export { useTechTracking } from "./useTechTracking";
export { useTechTrackingController } from "./useTechTrackingController";
export * from "./useTechnicianBookingMutations";
export * from "./useTechnicianBookingsQuery";
// Phase 4a Plan 06 — new lifecycle / state-machine hooks:
export * from "./useUserActiveOrder";
export * from "./useUserOrders";
export * from "./useUserRescheduleRequests";
