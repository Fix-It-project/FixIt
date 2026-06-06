import type { HistoryOrder } from "./common";

export interface TopTech {
	name: string;
	initials: string;
	color: string;
	specialty: string;
	jobs: number;
	rating: number;
	revenue: string;
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

export type AvailabilityFilter = "all" | "online" | "offline";

// ---- Admin technicians API (wired to backend) ----

export type TechnicianStatus = "pending" | "verified" | "blocked" | "rejected";

export interface AdminTechnicianDocument {
	kind: string;
	status: "uploaded" | "missing";
}

/** Technician order-history row (detail page). */
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

/** Technician summary row from the admin API (history loads separately). */
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
	blockedReason?: string;
	blockedAt?: string;
	blockedBy?: string;
}

export type TechnicianSort = "newest" | "most_completed" | "highest_rating" | "most_revenue";
