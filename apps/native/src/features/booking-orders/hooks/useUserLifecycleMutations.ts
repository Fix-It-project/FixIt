// User-side lifecycle mutation hooks. See `_lifecycle-mutation-factory` for the
// shared `useMutation` wrapper (optimistic transition + invalidation + cleanup).

import {
	createCardSession,
	switchToCash,
	userAcceptQuote,
	userApproveReschedule,
	userCancelOrder,
	userConfirmCompletion,
	userDeclineCompletion,
	userRejectReschedule,
	userRequestReschedule,
	userSubmitQuote,
	userWithdrawReschedule,
} from "../api/orders";
import {
	invalidateDistance,
	invalidateOrderReschedule,
	invalidateQuotes,
	invalidateUserOrders,
	useLifecycleMutation,
} from "./_lifecycle-mutation-factory";

interface UserCancelArgs {
	orderId: string;
	reason?: string;
}
export function useUserCancelOrder() {
	return useLifecycleMutation<
		UserCancelArgs,
		Awaited<ReturnType<typeof userCancelOrder>>
	>(({ orderId, reason }) => userCancelOrder(orderId, reason), {
		optimisticTo: "cancelled_by_user",
		extractOrderId: (a) => a.orderId,
		invalidate: (qc, a) => {
			invalidateUserOrders(qc);
			invalidateDistance(qc, a.orderId);
			invalidateQuotes(qc, a.orderId);
		},
	});
}

interface UserRequestRescheduleArgs {
	orderId: string;
	proposedDateIso: string;
	proposedStartAtIso: string;
	reason: string;
}
export function useUserRequestReschedule() {
	return useLifecycleMutation<
		UserRequestRescheduleArgs,
		Awaited<ReturnType<typeof userRequestReschedule>>
	>(
		({ orderId, proposedDateIso, proposedStartAtIso, reason }) =>
			userRequestReschedule(
				orderId,
				proposedDateIso,
				proposedStartAtIso,
				reason,
			),
		{
			optimisticTo: "reschedule_requested_by_user",
			extractOrderId: (a) => a.orderId,
			invalidate: (qc) => {
				invalidateUserOrders(qc);
			},
		},
	);
}

interface UserSwitchToCashArgs {
	orderId: string;
}
/** "Pay cash instead": completes a stuck awaiting_payment (card) order off-site. */
export function useUserSwitchToCash() {
	return useLifecycleMutation<
		UserSwitchToCashArgs,
		Awaited<ReturnType<typeof switchToCash>>
	>(({ orderId }) => switchToCash(orderId), {
		optimisticTo: "completed",
		extractOrderId: (a) => a.orderId,
		invalidate: (qc) => {
			invalidateUserOrders(qc);
		},
	});
}

interface UserCardSessionArgs {
	orderId: string;
}
export function useUserCreateCardSession() {
	return useLifecycleMutation<
		UserCardSessionArgs,
		Awaited<ReturnType<typeof createCardSession>>
	>(({ orderId }) => createCardSession(orderId), {
		optimisticTo: null,
		extractOrderId: (a) => a.orderId,
		invalidate: (qc) => {
			invalidateUserOrders(qc);
		},
	});
}

interface UserSubmitQuoteArgs {
	orderId: string;
	amount: number;
	notes?: string;
}
export function useUserSubmitQuote() {
	return useLifecycleMutation<
		UserSubmitQuoteArgs,
		Awaited<ReturnType<typeof userSubmitQuote>>
	>(({ orderId, amount, notes }) => userSubmitQuote(orderId, amount, notes), {
		optimisticTo: "negotiating",
		extractOrderId: (a) => a.orderId,
		invalidate: (qc, a) => {
			invalidateQuotes(qc, a.orderId);
			invalidateUserOrders(qc);
		},
	});
}

interface UserAcceptQuoteArgs {
	orderId: string;
	quoteId: string;
}
export function useUserAcceptQuote() {
	return useLifecycleMutation<
		UserAcceptQuoteArgs,
		Awaited<ReturnType<typeof userAcceptQuote>>
	>(({ orderId, quoteId }) => userAcceptQuote(orderId, quoteId), {
		optimisticTo: "in_progress",
		extractOrderId: (a) => a.orderId,
		invalidate: (qc, a) => {
			invalidateUserOrders(qc);
			invalidateQuotes(qc, a.orderId);
		},
	});
}

interface UserConfirmCompletionArgs {
	orderId: string;
}
export function useUserConfirmCompletion() {
	return useLifecycleMutation<
		UserConfirmCompletionArgs,
		Awaited<ReturnType<typeof userConfirmCompletion>>
	>(({ orderId }) => userConfirmCompletion(orderId), {
		// Method-dependent target (cash → completed, card → awaiting_payment) isn't
		// known from orderId alone, so let the server response drive the status.
		optimisticTo: null,
		extractOrderId: (a) => a.orderId,
		invalidate: (qc) => {
			invalidateUserOrders(qc);
		},
	});
}

export function useUserDeclineCompletion() {
	return useLifecycleMutation<
		UserConfirmCompletionArgs,
		Awaited<ReturnType<typeof userDeclineCompletion>>
	>(({ orderId }) => userDeclineCompletion(orderId), {
		// Decline keeps status='in_progress' — no optimistic transition needed.
		optimisticTo: null,
		extractOrderId: (a) => a.orderId,
		invalidate: (qc) => {
			invalidateUserOrders(qc);
		},
	});
}

// ─── Reschedule (user-side approve/reject/withdraw) ────────────────────────

interface OrderIdArgs {
	orderId: string;
}
interface OrderIdReasonArgs {
	orderId: string;
	reason: string;
}

export function useUserApproveReschedule() {
	return useLifecycleMutation<
		OrderIdArgs,
		Awaited<ReturnType<typeof userApproveReschedule>>
	>(({ orderId }) => userApproveReschedule(orderId), {
		optimisticTo: null,
		extractOrderId: (a) => a.orderId,
		invalidate: (qc, a) => {
			invalidateUserOrders(qc);
			invalidateOrderReschedule(qc, a.orderId);
		},
	});
}

export function useUserRejectReschedule() {
	return useLifecycleMutation<
		OrderIdReasonArgs,
		Awaited<ReturnType<typeof userRejectReschedule>>
	>(({ orderId, reason }) => userRejectReschedule(orderId, reason), {
		optimisticTo: null,
		extractOrderId: (a) => a.orderId,
		invalidate: (qc, a) => {
			invalidateUserOrders(qc);
			invalidateOrderReschedule(qc, a.orderId);
		},
	});
}

export function useUserWithdrawReschedule() {
	return useLifecycleMutation<
		OrderIdArgs,
		Awaited<ReturnType<typeof userWithdrawReschedule>>
	>(({ orderId }) => userWithdrawReschedule(orderId), {
		optimisticTo: null,
		extractOrderId: (a) => a.orderId,
		invalidate: (qc, a) => {
			invalidateUserOrders(qc);
			invalidateOrderReschedule(qc, a.orderId);
		},
	});
}
