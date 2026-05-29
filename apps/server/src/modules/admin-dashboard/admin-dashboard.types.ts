// Response shapes for the admin dashboard endpoints (mirror the admin frontend types).

export interface KpiMetric {
	label: string;
	value: string;
	delta: number;
	deltaLabel: string;
	icon: string;
	trend: number[];
	/** Prior-period figure (e.g. orders in the previous 30 days). Omitted for snapshot metrics. */
	previous?: string;
}

export interface CategoryShare {
	id: string;
	name: string;
	color: string;
	pct: number;
}

export interface StatusShare {
	key: string;
	label: string;
	count: number;
	color: string;
}

export interface DashboardOrderReview {
	rating: number;
	comment: string | null;
	customer: string;
	date: string;
}

export interface DashboardOrder {
	id: string;
	customer: string;
	tech: string;
	techInitials: string;
	techColor: string;
	category: string;
	status: string;
	amount: number;
	time: string;
	when: string;
	cancelReason?: string;
	review?: DashboardOrderReview | null;
}

export interface TopTech {
	name: string;
	initials: string;
	color: string;
	specialty: string;
	jobs: number;
	rating: number;
	revenue: string;
}

export interface TopTechnicians {
	overall: TopTech[];
	byCategory: TopTech[];
}

export interface DashboardSummary {
	kpis: KpiMetric[];
	categoryShare: CategoryShare[];
	statusShare: StatusShare[];
	recentOrders: DashboardOrder[];
	topTechnicians: TopTechnicians;
}

export interface OrdersSeries {
	days: string[];
	ordersMade: number[];
	accepted: number[];
	completed: number[];
}

export type SeriesRange = "7d" | "30d" | "90d";

// ---- Orders list (admin orders page) ----

export interface AdminOrderReview {
	rating: number;
	comment: string | null;
	customer: string;
	date: string;
}

export interface AdminOrder {
	id: string;
	customer: string;
	tech: string;
	techInitials: string;
	techColor: string;
	category: string;
	status: string;
	amount: number;
	time: string;
	when: string;
	createdAt: string;
	cancelReason?: string;
	review?: AdminOrderReview | null;
}
