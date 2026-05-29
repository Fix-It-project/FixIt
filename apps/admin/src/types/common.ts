import type { OrderReview } from "./orders";

export interface Category {
	id: string;
	name: string;
	color: string;
	icon: string;
}

export interface HistoryOrder {
	id: string;
	date: string;
	category: string;
	customer: string;
	status: "completed" | "cancelled" | "no_show";
	cancelReason: string | null;
	cancelledBy: "customer" | "technician" | "system" | null;
	review: OrderReview | null;
	amount: number;
}

export interface StatusMeta {
	label: string;
	cls: "success" | "warn" | "danger" | "muted";
}
