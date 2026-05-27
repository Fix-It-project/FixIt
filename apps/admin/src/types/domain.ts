export interface Category {
	id: string;
	name: string;
	color: string;
	icon: string;
}

export interface KpiMetric {
	label: string;
	value: string;
	delta: number;
	deltaLabel: string;
	icon: string;
	trend: number[];
}

export interface OrderSeries {
	days: number[];
	homeowner: number[];
	technician: number[];
}

export interface CategoryShare {
	id: string;
	pct: number;
}

export interface StatusShare {
	key: string;
	label: string;
	count: number;
	color: string;
}

export interface OrderReview {
	rating: number;
	comment: string | null;
	customer: string;
	date: string;
}

export type OrderStatus = "pending" | "accepted" | "in_progress" | "completed" | "cancelled";

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

export interface TopTech {
	name: string;
	initials: string;
	color: string;
	specialty: string;
	jobs: number;
	rating: number;
	revenue: string;
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

export interface Document {
	kind: string;
	status: "uploaded" | "missing" | "expired";
	filename?: string;
	size?: string;
	uploaded?: string;
	note?: string;
}

export interface ActiveTech {
	id: string;
	name: string;
	initials: string;
	color: string;
	specialty: string;
	city: string;
	joined: string;
	completed: number;
	rating: number;
	reviews: number;
	revenue: string;
	availability: "online" | "offline";
	blocked: boolean;
	phone: string;
	email: string;
	history: HistoryOrder[];
	blockedReason?: string;
	blockedAt?: string;
	blockedBy?: string;
}

export interface PendingTech {
	id: string;
	name: string;
	initials: string;
	color: string;
	specialty: string;
	city: string;
	appliedAt: string;
	yearsExp: number;
	phone: string;
	email: string;
	documents: Document[];
	flags: string[];
}

export interface StatusMeta {
	label: string;
	cls: "success" | "warn" | "danger" | "muted";
}

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

export type ReportSource = "customer" | "technician";
export type ReportStatus = "open" | "closed";
export type ReportResolution = "resolved" | "dismissed";

export interface Report {
	id: string;
	orderId: string;
	reporterName: string;
	reporterInitials: string;
	reporterColor: string;
	reporterRole: ReportSource;
	against: string;
	category: string;
	filedAt: string;
	summary: string;
	description: string;
	status: ReportStatus;
	resolution?: ReportResolution;
	closedAt?: string;
	closedBy?: string;
}
