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

export type Range = "7d" | "30d" | "90d";
export type TechRankTab = "overall" | "category";
