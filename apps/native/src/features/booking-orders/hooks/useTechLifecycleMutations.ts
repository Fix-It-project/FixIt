// Technician-side lifecycle mutation hooks. See `_lifecycle-mutation-factory`
// for the shared `useMutation` wrapper.

import {
	techAccept,
	techAcceptUserQuote,
	techApproveReschedule,
	techCancel,
	techConfirmCashReceived,
	techConfirmCompletion,
	techDecline,
	techDeclineCompletion,
	techFinishInspection,
	techMarkArrived,
	techRejectReschedule,
	techRequestReschedule,
	techStartTracking,
	techSubmitQuote,
	techWithdrawReschedule,
} from "../api/technician-bookings";
import {
	invalidateDistance,
	invalidateOrderReschedule,
	invalidateQuotes,
	invalidateTechBookings,
	useLifecycleMutation,
} from "./_lifecycle-mutation-factory";

interface TechSimpleArgs {
	orderId: string;
}
interface TechReasonArgs {
	orderId: string;
	reason?: string;
}

export function useTechAccept() {
	return useLifecycleMutation<
		TechSimpleArgs,
		Awaited<ReturnType<typeof techAccept>>
	>(({ orderId }) => techAccept(orderId), {
		optimisticTo: "accepted",
		extractOrderId: (a) => a.orderId,
		invalidate: (qc) => {
			invalidateTechBookings(qc);
		},
	});
}

export function useTechDecline() {
	return useLifecycleMutation<
		TechReasonArgs,
		Awaited<ReturnType<typeof techDecline>>
	>(({ orderId, reason }) => techDecline(orderId, reason), {
		optimisticTo: "declined_by_technician",
		extractOrderId: (a) => a.orderId,
		invalidate: (qc) => {
			invalidateTechBookings(qc);
		},
	});
}

export function useTechCancel() {
	return useLifecycleMutation<
		TechReasonArgs,
		Awaited<ReturnType<typeof techCancel>>
	>(({ orderId, reason }) => techCancel(orderId, reason), {
		// Backend decides cancelled_with_fee / cancelled_no_fee via the Phase 1
		// fee gate; hint with cancelled_with_fee. Refetch corrects if it disagrees.
		optimisticTo: "cancelled_with_fee",
		extractOrderId: (a) => a.orderId,
		invalidate: (qc) => {
			invalidateTechBookings(qc);
		},
	});
}

export function useTechStartTracking() {
	return useLifecycleMutation<
		TechSimpleArgs,
		Awaited<ReturnType<typeof techStartTracking>>
	>(({ orderId }) => techStartTracking(orderId), {
		optimisticTo: "tracking",
		extractOrderId: (a) => a.orderId,
		invalidate: (qc, a) => {
			invalidateTechBookings(qc);
			invalidateDistance(qc, a.orderId);
		},
	});
}

export function useTechMarkArrived() {
	return useLifecycleMutation<
		TechSimpleArgs,
		Awaited<ReturnType<typeof techMarkArrived>>
	>(({ orderId }) => techMarkArrived(orderId), {
		optimisticTo: "arrived_inspection",
		extractOrderId: (a) => a.orderId,
		invalidate: (qc, a) => {
			invalidateTechBookings(qc);
			invalidateDistance(qc, a.orderId);
		},
	});
}

export function useTechFinishInspection() {
	return useLifecycleMutation<
		TechSimpleArgs,
		Awaited<ReturnType<typeof techFinishInspection>>
	>(({ orderId }) => techFinishInspection(orderId), {
		optimisticTo: "awaiting_final_cost",
		extractOrderId: (a) => a.orderId,
		invalidate: (qc) => {
			invalidateTechBookings(qc);
		},
	});
}

interface TechSubmitQuoteArgs {
	orderId: string;
	amount: number;
	notes?: string;
}
export function useTechSubmitQuote() {
	return useLifecycleMutation<
		TechSubmitQuoteArgs,
		Awaited<ReturnType<typeof techSubmitQuote>>
	>(({ orderId, amount, notes }) => techSubmitQuote(orderId, amount, notes), {
		optimisticTo: "negotiating",
		extractOrderId: (a) => a.orderId,
		invalidate: (qc, a) => {
			invalidateQuotes(qc, a.orderId);
			invalidateTechBookings(qc);
		},
	});
}

interface TechAcceptUserQuoteArgs {
	orderId: string;
	quoteId: string;
}
export function useTechAcceptUserQuote() {
	return useLifecycleMutation<
		TechAcceptUserQuoteArgs,
		Awaited<ReturnType<typeof techAcceptUserQuote>>
	>(({ orderId, quoteId }) => techAcceptUserQuote(orderId, quoteId), {
		optimisticTo: "in_progress",
		extractOrderId: (a) => a.orderId,
		invalidate: (qc, a) => {
			invalidateQuotes(qc, a.orderId);
			invalidateTechBookings(qc);
		},
	});
}

export function useTechConfirmCompletion() {
	return useLifecycleMutation<
		TechSimpleArgs,
		Awaited<ReturnType<typeof techConfirmCompletion>>
	>(({ orderId }) => techConfirmCompletion(orderId), {
		optimisticTo: "awaiting_payment",
		extractOrderId: (a) => a.orderId,
		invalidate: (qc) => {
			invalidateTechBookings(qc);
		},
	});
}

export function useTechDeclineCompletion() {
	return useLifecycleMutation<
		TechSimpleArgs,
		Awaited<ReturnType<typeof techDeclineCompletion>>
	>(({ orderId }) => techDeclineCompletion(orderId), {
		optimisticTo: null,
		extractOrderId: (a) => a.orderId,
		invalidate: (qc) => {
			invalidateTechBookings(qc);
		},
	});
}

export function useTechMarkCashReceived() {
	return useLifecycleMutation<
		TechSimpleArgs,
		Awaited<ReturnType<typeof techConfirmCashReceived>>
	>(({ orderId }) => techConfirmCashReceived(orderId), {
		optimisticTo: "completed",
		extractOrderId: (a) => a.orderId,
		invalidate: (qc) => {
			invalidateTechBookings(qc);
		},
	});
}

// ─── Reschedule (tech-side request/approve/reject/withdraw) ────────────────

interface TechRequestRescheduleArgs {
	orderId: string;
	proposedDateIso: string;
	reason: string;
}
interface OrderIdArgs {
	orderId: string;
}
interface OrderIdReasonArgs {
	orderId: string;
	reason: string;
}

export function useTechRequestReschedule() {
	return useLifecycleMutation<
		TechRequestRescheduleArgs,
		Awaited<ReturnType<typeof techRequestReschedule>>
	>(
		({ orderId, proposedDateIso, reason }) =>
			techRequestReschedule(orderId, proposedDateIso, reason),
		{
			optimisticTo: "reschedule_requested_by_technician",
			extractOrderId: (a) => a.orderId,
			invalidate: (qc, a) => {
				invalidateTechBookings(qc);
				invalidateOrderReschedule(qc, a.orderId);
			},
		},
	);
}

export function useTechApproveReschedule() {
	return useLifecycleMutation<
		OrderIdArgs,
		Awaited<ReturnType<typeof techApproveReschedule>>
	>(({ orderId }) => techApproveReschedule(orderId), {
		optimisticTo: null,
		extractOrderId: (a) => a.orderId,
		invalidate: (qc, a) => {
			invalidateTechBookings(qc);
			invalidateOrderReschedule(qc, a.orderId);
		},
	});
}

export function useTechRejectReschedule() {
	return useLifecycleMutation<
		OrderIdReasonArgs,
		Awaited<ReturnType<typeof techRejectReschedule>>
	>(({ orderId, reason }) => techRejectReschedule(orderId, reason), {
		optimisticTo: null,
		extractOrderId: (a) => a.orderId,
		invalidate: (qc, a) => {
			invalidateTechBookings(qc);
			invalidateOrderReschedule(qc, a.orderId);
		},
	});
}

export function useTechWithdrawReschedule() {
	return useLifecycleMutation<
		OrderIdArgs,
		Awaited<ReturnType<typeof techWithdrawReschedule>>
	>(({ orderId }) => techWithdrawReschedule(orderId), {
		optimisticTo: null,
		extractOrderId: (a) => a.orderId,
		invalidate: (qc, a) => {
			invalidateTechBookings(qc);
			invalidateOrderReschedule(qc, a.orderId);
		},
	});
}
