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

// ---- Homeowners (admin homeowners page) ----

export interface AdminHomeownerHistory {
	id: string;
	date: string;
	category: string;
	tech: string;
	status: string;
	amount: number;
	rating: number | null;
}

// ---- Order detail (admin order-detail modal) ----

export interface AdminOrderQuote {
	proposedBy: string;
	amount: number;
	round: number;
	status: string;
	notes: string | null;
	createdAt: string;
}

export interface AdminOrderEvent {
	type: string;
	fromStatus: string | null;
	toStatus: string | null;
	actorRole: string;
	createdAt: string;
}

export interface AdminOrderPayment {
	amount: number;
	method: string;
	status: string;
	paidAt: string | null;
}

export interface AdminOrderDetail {
	id: string;
	problemDescription: string | null;
	status: string;
	createdAt: string;
	scheduledDate: string | null;
	scheduledStartAt: string | null;
	arrivedAt: string | null;
	userCompletedAt: string | null;
	technicianCompletedAt: string | null;
	finalPrice: number | null;
	paymentMethod: string | null;
	cancellationReason: string | null;
	attachment: string | null;
	customer: string;
	tech: string;
	category: string;
	review: { rating: number; comment: string | null; date: string } | null;
	quotes: AdminOrderQuote[];
	events: AdminOrderEvent[];
	payments: AdminOrderPayment[];
}

export interface AdminHomeowner {
	id: string;
	name: string;
	initials: string;
	color: string;
	phone: string;
	email: string;
	city: string;
	joined: string;
	joinedAt: string;
	totalOrders: number;
	completed: number;
	cancelled: number;
	spend: string;
	spendValue: number;
	avgRatingGiven: number | null;
	lastOrder: string;
	lastOrderAt: string | null;
	blocked: boolean;
	blockPending: boolean;
	blockedReason?: string;
	blockedAt?: string;
	blockedBy?: string;
	history: AdminHomeownerHistory[];
}

// ---- Technicians (admin technicians page) ----

export type TechnicianStatus = "pending" | "verified" | "blocked" | "rejected";

export interface AdminTechnicianDocument {
	kind: string;
	status: "uploaded" | "missing";
	/** Public Supabase Storage URL of the uploaded document, or null if missing. */
	url: string | null;
}

/** Tech order-history row (detail page). Mirrors the admin HistoryOrder shape. */
export interface AdminTechnicianHistory {
	id: string;
	date: string;
	category: string;
	customer: string;
	status: string;
	cancelReason: string | null;
	cancelledBy: "customer" | "technician" | "system" | null;
	review: { rating: number; comment: string | null } | null;
	amount: number;
}

/** Technician summary row for the admin list (history loads separately). */
export interface AdminTechnician {
	id: string;
	name: string;
	initials: string;
	color: string;
	specialty: string;
	city: string;
	phone: string;
	email: string;
	joined: string;
	joinedAt: string;
	appliedAt: string;
	availability: "online" | "offline";
	rating: number | null;
	reviews: number;
	completed: number;
	totalOrders: number;
	cancelled: number;
	revenue: string;
	revenueValue: number;
	yearsExperience: number | null;
	documents: AdminTechnicianDocument[];
	status: TechnicianStatus;
	blocked: boolean;
	blockPending: boolean;
	blockedReason?: string;
	blockedAt?: string;
	blockedBy?: string;
}
