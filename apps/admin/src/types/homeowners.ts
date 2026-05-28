export interface HomeownerOrderHistory {
	id: string;
	date: string;
	category: string;
	tech: string;
	status: "completed" | "cancelled" | "no_show";
	amount: number;
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
	history: HomeownerOrderHistory[];
}

export type ActivityFilter = "all" | "recent" | "dormant";
