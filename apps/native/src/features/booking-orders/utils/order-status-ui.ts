import type { TFunction } from "i18next";
import {
	AlertTriangle,
	CheckCircle,
	Clock,
	type LucideIcon,
	XCircle,
} from "lucide-react-native";
import type { ThemeColors } from "@/src/constants/design-tokens";
import type { OrderStatus } from "@/src/features/booking-orders/schemas/order-status.schema";

// Re-export the wider OrderStatus so downstream files that imported it from
// here continue to compile against the lifecycle-aware union.
export type { OrderStatus } from "@/src/features/booking-orders/schemas/order-status.schema";

export type OrderStatusPerspective = "user" | "technician" | "neutral";

const BASE_STATUS_LABELS: Record<OrderStatus, string> = {
	// New lifecycle (Phase 1)
	pending: "Pending",
	accepted: "Accepted",
	tracking: "On the way",
	arrived_inspection: "Inspecting",
	awaiting_final_cost: "Quote pending",
	negotiating: "Negotiating quote",
	in_progress: "Inspecting",
	awaiting_payment: "Awaiting payment",
	completed: "Completed",
	declined_by_technician: "Declined by technician",
	cancelled_no_fee: "Cancelled",
	cancelled_with_fee: "Cancelled (fee applied)",
	// Legacy compat
	rejected: "Rejected",
	cancelled: "Cancelled",
	cancelled_by_user: "Cancelled by user",
	cancelled_by_technician: "Cancelled by technician",
	reschedule_requested_by_user: "Reschedule requested by user",
	reschedule_requested_by_technician: "Reschedule requested by technician",
};

const USER_STATUS_LABELS: Partial<Record<OrderStatus, string>> = {
	// New lifecycle
	pending: "Waiting for technician to accept",
	accepted: "Accepted by technician",
	tracking: "Technician on the way",
	arrived_inspection: "Technician inspecting",
	awaiting_final_cost: "Reviewing final price",
	negotiating: "Negotiating final price",
	in_progress: "Technician inspecting",
	awaiting_payment: "Hand over cash and confirm",
	declined_by_technician: "Declined by technician",
	cancelled_no_fee: "Cancelled",
	cancelled_with_fee: "Cancelled (fee applied)",
	// Legacy compat
	rejected: "Rejected by technician",
	cancelled_by_user: "Cancelled by you",
	reschedule_requested_by_user: "Reschedule requested by you",
};

const TECHNICIAN_STATUS_LABELS: Partial<Record<OrderStatus, string>> = {
	// New lifecycle
	pending: "New request — accept or decline",
	accepted: "You accepted — start tracking",
	tracking: "Heading to client",
	arrived_inspection: "Inspecting on site",
	awaiting_final_cost: "Send final price",
	negotiating: "Quote round in progress",
	in_progress: "Inspecting on site",
	awaiting_payment: "Awaiting cash from client",
	declined_by_technician: "Declined by you",
	cancelled_no_fee: "Cancelled",
	cancelled_with_fee: "Cancelled (fee applied)",
	// Legacy compat
	cancelled_by_user: "Cancelled by client",
	cancelled_by_technician: "Cancelled by you",
	reschedule_requested_by_user: "Reschedule requested by client",
	reschedule_requested_by_technician: "Reschedule requested by you",
};

const STATUS_ICONS: Record<OrderStatus, LucideIcon> = {
	// New lifecycle
	pending: Clock,
	accepted: CheckCircle,
	tracking: Clock,
	arrived_inspection: Clock,
	awaiting_final_cost: Clock,
	negotiating: Clock,
	in_progress: Clock,
	awaiting_payment: Clock,
	completed: CheckCircle,
	declined_by_technician: XCircle,
	cancelled_no_fee: XCircle,
	cancelled_with_fee: AlertTriangle,
	// Legacy compat
	rejected: XCircle,
	cancelled: XCircle,
	cancelled_by_user: XCircle,
	cancelled_by_technician: AlertTriangle,
	reschedule_requested_by_user: Clock,
	reschedule_requested_by_technician: Clock,
};

/**
 * Resolve a human status label. Pass a `t` bound to the `orders` namespace to
 * localize; omit it to fall back to the English maps (used by callers that
 * have not been migrated to i18n yet).
 */
export function getOrderStatusLabel(
	status: OrderStatus,
	perspective: OrderStatusPerspective = "neutral",
	t?: TFunction,
): string {
	if (t) {
		const base = t(`status.base.${status}` as Parameters<typeof t>[0]);
		if (perspective === "neutral") return base;
		return t(`status.${perspective}.${status}` as Parameters<typeof t>[0], {
			defaultValue: base,
		});
	}
	if (perspective === "user") {
		return USER_STATUS_LABELS[status] ?? BASE_STATUS_LABELS[status];
	}
	if (perspective === "technician") {
		return TECHNICIAN_STATUS_LABELS[status] ?? BASE_STATUS_LABELS[status];
	}
	return BASE_STATUS_LABELS[status];
}

export function getOrderStatusBadge(
	status: OrderStatus,
	themeColors: ThemeColors,
	perspective: OrderStatusPerspective = "neutral",
	t?: TFunction,
) {
	if (status === "accepted" || status === "completed") {
		return {
			label: getOrderStatusLabel(status, perspective, t),
			color: themeColors.success,
			bg: themeColors.orderBg,
			icon: STATUS_ICONS[status],
		};
	}

	if (status === "pending" || status.startsWith("reschedule_requested")) {
		return {
			label: getOrderStatusLabel(status, perspective, t),
			color: themeColors.warning,
			bg: themeColors.warningLight,
			icon: STATUS_ICONS[status],
		};
	}

	return {
		label: getOrderStatusLabel(status, perspective, t),
		color: themeColors.danger,
		bg: themeColors.dangerLight,
		icon: STATUS_ICONS[status],
	};
}

export function isPastOrderStatus(status: OrderStatus): boolean {
	return (
		// Terminal lifecycle (Phase 1)
		status === "completed" ||
		status === "declined_by_technician" ||
		status === "cancelled_no_fee" ||
		status === "cancelled_with_fee" ||
		// Terminal legacy compat
		status === "rejected" ||
		status === "cancelled" ||
		status === "cancelled_by_user" ||
		status === "cancelled_by_technician"
	);
}
