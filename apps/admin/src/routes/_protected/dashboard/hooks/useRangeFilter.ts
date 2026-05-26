import { useState } from "react";
import { ORDERS_SERIES } from "@/data/mockData";
import type { OrderSeries } from "@/types/domain";

type Range = "7d" | "30d" | "90d";

export function useRangeFilter() {
	const [range, setRange] = useState<Range>("30d");

	const sliced: OrderSeries = (() => {
		const days = range === "7d" ? 7 : range === "90d" ? 90 : 30;
		const start = Math.max(0, ORDERS_SERIES.days.length - days);
		return {
			days: ORDERS_SERIES.days.slice(start),
			homeowner: ORDERS_SERIES.homeowner.slice(start),
			technician: ORDERS_SERIES.technician.slice(start),
		};
	})();

	return { range, setRange, series: sliced };
}
