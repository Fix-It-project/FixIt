export type OrderStatus = "pending" | "accepted" | "in_progress" | "completed" | "cancelled";

/** Full DB `order_status` enum — used by the dashboard recent-orders table. */
export type OrderStatusRaw =
	| "pending"
	| "accepted"
	| "tracking"
	| "arrived_inspection"
	| "awaiting_final_cost"
	| "negotiating"
	| "in_progress"
	| "awaiting_payment"
	| "completed"
	| "declined_by_technician"
	| "cancelled_no_fee"
	| "cancelled_with_fee"
	| "reschedule_requested_by_user"
	| "reschedule_requested_by_technician"
	| "rejected"
	| "cancelled"
	| "cancelled_by_user"
	| "cancelled_by_technician";

export interface OrderReview {
	rating: number;
	comment: string | null;
	customer: string;
	date: string;
}

export interface Order {
	id: string;
	customer: string;
	tech: string;
	techInitials: string;
	techColor: string;
	category: string;
	status: OrderStatus;
	amount: number;
	time: string;
	when: string;
	cancelReason?: string;
	review?: OrderReview | null;
}

export type OrderFilter = "all" | "pending" | "active" | "completed" | "cancelled";

/** Dashboard recent-orders row — same shape as Order but carries the raw DB status. */
export interface RecentOrder {
	id: string;
	customer: string;
	tech: string;
	techInitials: string;
	techColor: string;
	category: string;
	status: OrderStatusRaw;
	amount: number;
	time: string;
	when: string;
	cancelReason?: string;
	review?: OrderReview | null;
}

export type RecentOrderFilter = "all" | "pending" | "accepted" | "active" | "cancelled";

/** Orders page row — RecentOrder plus an ISO timestamp for client-side date filtering. */
export interface AdminOrder extends RecentOrder {
	createdAt: string;
}

export type OrdersPageFilter =
	| "all"
	| "pending"
	| "accepted"
	| "active"
	| "completed"
	| "cancelled";

export type DateRangePreset = "all" | "today" | "7d" | "30d" | "90d";

export type AmountBucket = "all" | "lt100" | "100_500" | "500_1000" | "gt1000";

export interface ReviewView {
	rating: number;
	comment: string;
	customer: string;
	date: string;
	orderId: string;
}
