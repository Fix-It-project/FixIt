import type {
	AmountBucket,
	DateRangePreset,
	OrdersPageFilter,
	OrderStatusRaw,
	RecentOrderFilter,
} from "@/types";

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
	status: string,
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
export function statusVariant(status: string): StatusBadgeVariant {
	const bucket = recentOrderStatusBucket(status);
	if (bucket === "completed") return "success";
	if (bucket === "cancelled") return "danger";
	if (bucket === "pending" || bucket === "active") return "warn";
	return "muted"; // accepted
}

/** Does a raw status match the selected recent-orders filter chip? */
export function matchesRecentFilter(
	status: OrderStatusRaw,
	filter: RecentOrderFilter,
): boolean {
	if (filter === "all") return true;
	return recentOrderStatusBucket(status) === filter;
}

/** Does a raw status match the selected orders-page filter chip (includes completed)? */
export function matchesOrderFilter(
	status: OrderStatusRaw,
	filter: OrdersPageFilter,
): boolean {
	if (filter === "all") return true;
	return recentOrderStatusBucket(status) === filter;
}

/** Is an ISO timestamp within the selected preset window (ending now)? */
export function matchesDatePreset(
	createdAtISO: string,
	preset: DateRangePreset,
): boolean {
	if (preset === "all") return true;
	const days = preset === "today" ? 1 : preset === "7d" ? 7 : preset === "30d" ? 30 : 90;
	const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
	return new Date(createdAtISO).getTime() >= cutoff;
}

/** Does an amount fall in the selected EGP bucket? */
export function matchesAmountBucket(amount: number, bucket: AmountBucket): boolean {
	switch (bucket) {
		case "all":
			return true;
		case "lt100":
			return amount < 100;
		case "100_500":
			return amount >= 100 && amount <= 500;
		case "500_1000":
			return amount > 500 && amount <= 1000;
		case "gt1000":
			return amount > 1000;
	}
}
