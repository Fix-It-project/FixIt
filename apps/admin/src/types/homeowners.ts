export interface HomeownerOrderHistory {
	id: string;
	date: string;
	category: string;
	tech: string;
	status: string;
	amount: number;
	rating: number | null;
}

export interface Homeowner {
	id: string;
	name: string;
	initials: string;
	color: string;
	phone: string;
	email: string;
	city: string;
	joined: string;
	totalOrders: number;
	completed: number;
	cancelled: number;
	spend: string;
	avgRatingGiven: number | null;
	lastOrder: string;
	blocked: boolean;
	blockedReason?: string;
	blockedAt?: string;
	blockedBy?: string;
	// Per-order history loads separately (GET /api/admin/homeowners/:id/history),
	// so it is not part of the list payload.
}

export type ActivityFilter = "all" | "recent" | "dormant";

/** Homeowner row from the admin API — adds sortable raw fields. */
export interface AdminHomeowner extends Homeowner {
	joinedAt: string;
	lastOrderAt: string | null;
	spendValue: number;
	reportCount: number;
	blockPending: boolean;
}

export type HomeownerSort =
	| "newest"
	| "most_orders"
	| "most_spent"
	| "recent_order";
