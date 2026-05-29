import type { RecentOrder } from "./orders";
import type { TopTech } from "./technicians";

export interface KpiMetric {
	label: string;
	value: string;
	delta: number;
	deltaLabel: string;
	icon: string;
	trend: number[];
	previous?: string;
}

export interface OrderSeries {
	days: string[];
	ordersMade: number[];
	accepted: number[];
	completed: number[];
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

export type Range = "7d" | "30d" | "90d";
export type TechRankTab = "overall" | "category";

export interface TopTechnicians {
	overall: TopTech[];
	byCategory: TopTech[];
}

export interface DashboardSummary {
	kpis: KpiMetric[];
	categoryShare: CategoryShare[];
	statusShare: StatusShare[];
	recentOrders: RecentOrder[];
	topTechnicians: TopTechnicians;
}
