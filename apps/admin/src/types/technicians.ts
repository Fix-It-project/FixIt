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
