import type { OrderStatusRaw, RecentOrderFilter } from "@/types";

type StatusBadgeVariant = "success" | "warn" | "danger" | "muted";

const CANCELLED: ReadonlySet<string> = new Set([
	"cancelled",
	"cancelled_no_fee",
	"cancelled_with_fee",
	"cancelled_by_user",
	"cancelled_by_technician",
	"declined_by_technician",
	"rejected",
]);

/** Collapse a raw DB status into the recent-orders filter bucket. */
export function recentOrderStatusBucket(
	status: OrderStatusRaw,
): "pending" | "accepted" | "active" | "cancelled" | "completed" {
	if (status === "completed") return "completed";
	if (status === "pending") return "pending";
	if (status === "accepted") return "accepted";
	if (CANCELLED.has(status)) return "cancelled";
	return "active";
}

/** snake_case DB status → "Title Case" label. */
export function humanizeStatus(status: string): string {
	return status
		.split("_")
		.map((w) => (w ? w[0]!.toUpperCase() + w.slice(1) : ""))
		.join(" ");
}

/** StatusBadge color variant for a raw status. */
export function statusVariant(status: OrderStatusRaw): StatusBadgeVariant {
	const bucket = recentOrderStatusBucket(status);
	if (bucket === "completed") return "success";
	if (bucket === "cancelled") return "danger";
	if (bucket === "pending" || bucket === "active") return "warn";
	return "muted"; // accepted
}

/** Does a raw status match the selected filter chip? */
export function matchesRecentFilter(
	status: OrderStatusRaw,
	filter: RecentOrderFilter,
): boolean {
	if (filter === "all") return true;
	return recentOrderStatusBucket(status) === filter;
}
