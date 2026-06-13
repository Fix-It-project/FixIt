import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useAuthStore } from "@/src/stores/auth-store";
import { getTechHomeOrders } from "../api/tech-home";
import {
	ACTIVE_JOB_STATUSES,
	SCHEDULED_STATUSES,
	type TechHomeOrder,
} from "../schemas/orders.schema";
import { techHomeKeys } from "../schemas/query-keys";

function localToday(): string {
	const d = new Date();
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
		d.getDate(),
	).padStart(2, "0")}`;
}

export function useTechHomeOrdersQuery() {
	const user = useAuthStore((state) => state.user);

	return useQuery({
		queryKey: techHomeKeys.ordersFor(user?.id),
		queryFn: getTechHomeOrders,
		enabled: !!user?.id,
	});
}

/** Pending orders awaiting accept/decline, newest first. */
export function usePendingRequests() {
	const query = useTechHomeOrdersQuery();
	const data = useMemo(
		() =>
			(query.data ?? [])
				.filter((order) => order.status === "pending")
				// eslint-disable-next-line unicorn/no-array-sort -- Hermes has no Array.prototype.toSorted; filter() already copied
				.sort((a, b) =>
					(b.created_at ?? "").localeCompare(a.created_at ?? ""),
				),
		[query.data],
	);
	return { ...query, data };
}

/** The order the technician is physically working right now (if any). */
export function useActiveJob(): TechHomeOrder | undefined {
	const { data } = useTechHomeOrdersQuery();
	return useMemo(
		() => (data ?? []).find((o) => ACTIVE_JOB_STATUSES.has(o.status)),
		[data],
	);
}

/** Today's scheduled orders (accepted → completed), sorted by start time. */
export function useTodaySchedule(): TechHomeOrder[] {
	const { data } = useTechHomeOrdersQuery();
	return useMemo(() => {
		const today = localToday();
		return (data ?? [])
			.filter(
				(o) => o.scheduled_date === today && SCHEDULED_STATUSES.has(o.status),
			)
			// eslint-disable-next-line unicorn/no-array-sort -- Hermes has no Array.prototype.toSorted; filter() already copied
			.sort((a, b) =>
				(a.scheduled_start_at ?? "").localeCompare(b.scheduled_start_at ?? ""),
			);
	}, [data]);
}
