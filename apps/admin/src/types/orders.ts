export type OrderStatus = "pending" | "accepted" | "in_progress" | "completed" | "cancelled";

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

export interface ReviewView {
	rating: number;
	comment: string;
	customer: string;
	date: string;
	orderId: string;
}
